package com.cobuild.backend.membership;

import com.cobuild.backend.exception.BadRequestException;
import com.cobuild.backend.exception.ConflictException;
import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.membership.dto.request.AddMemberRequest;
import com.cobuild.backend.membership.dto.response.MembershipResponse;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.role.ProjectRole;
import com.cobuild.backend.role.ProjectRoleRepository;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MembershipServiceImpl implements MembershipService {

        private final MembershipRepository membershipRepository;
        private final ProjectRepository projectRepository;
        private final UserRepository userRepository;
        private final ProjectRoleRepository projectRoleRepository;

        @Override
        @Transactional
        public MembershipResponse addMember(AddMemberRequest request) {

                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                User currentUser = getCurrentUser();

                if (!project.getOwner().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException(
                                        "Only the project owner can add members");
                }

                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (membershipRepository.existsByUserAndProject(user, project)) {
                        throw new DuplicateResourceException(
                                        "User is already a member of this project");
                }

                Membership membership = Membership.builder()
                                .user(user)
                                .project(project)
                                .membershipRole(MembershipRole.MEMBER)
                                .status(MembershipStatus.ACTIVE)
                                .build();

                return mapToResponse(membershipRepository.save(membership));
        }

        @Override
        public List<MembershipResponse> getProjectMembers(UUID projectId) {

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                return membershipRepository.findByProjectAndStatusIn(
                                project, 
                                List.of(MembershipStatus.ACTIVE, MembershipStatus.LEAVE_PENDING))
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public List<MembershipResponse> getUserMemberships(UUID userId) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                return membershipRepository.findByUserAndStatusIn(
                                user, 
                                List.of(MembershipStatus.ACTIVE, MembershipStatus.LEAVE_PENDING))
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        @Transactional
        public void removeMember(
                        UUID projectId,
                        UUID userId,
                        String ownerEmail,
                        String message) {
                Membership membership = membershipRepository
                                .findByProjectIdAndUserId(projectId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Membership not found"));

                // Find authenticated user
                User authenticatedUser = userRepository
                                .findByEmail(ownerEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found"));

                // Only project owner can remove members
                if (!membership
                                .getProject()
                                .getOwner()
                                .getId()
                                .equals(authenticatedUser.getId())) {

                        throw new ForbiddenException(
                                        "You are not authorized to remove members from this project");
                }

                // Membership must currently be active
                if (membership.getStatus() != MembershipStatus.ACTIVE) {

                        throw new BadRequestException(
                                        "Membership is not active");
                }

                // Project owner cannot be removed
                if (membership.getMembershipRole() == MembershipRole.OWNER) {

                        throw new BadRequestException(
                                        "Project owner cannot be removed");
                }

                // Lock the role because we're changing filledCount
                ProjectRole role = projectRoleRepository
                                .findByIdForUpdate(
                                                membership.getProjectRole().getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Project role not found"));

                // Mark membership as removed
                membership.setStatus(MembershipStatus.REMOVED);
                membership.setStatusMessage(message);

                // Free one opening
                // Free one opening
                if (role.getFilledCount() > 0) {

                        role.setFilledCount(
                                        role.getFilledCount() - 1);
                }

                membershipRepository.save(membership);

                projectRoleRepository.save(role);
        }

        private User getCurrentUser() {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new ForbiddenException("Unauthorized");
                }

                Object principal = authentication.getPrincipal();

                if (!(principal instanceof UserPrincipal userPrincipal)) {
                        throw new ForbiddenException("Unauthorized");
                }

                User user = userPrincipal.getUser();

                if (user == null) {
                        throw new ForbiddenException("Unauthorized");
                }

                return user;
        }

        private MembershipResponse mapToResponse(Membership membership) {

                User user = membership.getUser();
                Project project = membership.getProject();

                return MembershipResponse.builder()
                                .id(membership.getId())
                                .userId(user != null ? user.getId() : null)
                                .userName(user != null ? user.getName() : null)
                                .projectId(project != null ? project.getId() : null)
                                .projectTitle(project != null ? project.getTitle() : null)
                                .role(membership.getMembershipRole())
                                .status(membership.getStatus())
                                .statusMessage(membership.getStatusMessage())
                                .joinedAt(membership.getJoinedAt())
                                .build();
        }

        @Transactional
        public void leaveProject(
                        UUID membershipId,
                        String userEmail,
                        String message) {

                // Find ACTIVE membership
                Membership membership = membershipRepository
                                .findByIdAndStatus(
                                                membershipId,
                                                MembershipStatus.ACTIVE)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Active membership not found"));

                // Find authenticated user
                User user = userRepository
                                .findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found"));

                // Only the member themselves can leave
                if (!membership.getUser().getId().equals(user.getId())) {

                        throw new ForbiddenException(
                                        "You cannot leave this membership");
                }

                // Owner should not leave using normal member flow
                if (membership.getMembershipRole() == MembershipRole.OWNER) {

                        throw new ConflictException(
                                        "Project owner cannot leave the project. Transfer ownership first.");
                }

                // Mark membership as LEAVE_PENDING
                membership.setStatus(MembershipStatus.LEAVE_PENDING);
                membership.setStatusMessage(message);

                membershipRepository.save(membership);
        }

        @Override
        @Transactional
        public void approveLeave(UUID membershipId, String message) {
                // Find LEAVE_PENDING membership
                Membership membership = membershipRepository
                                .findByIdAndStatus(
                                                membershipId,
                                                MembershipStatus.LEAVE_PENDING)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Pending leave request not found"));

                // Verify current user is owner
                User currentUser = getCurrentUser();
                if (!membership.getProject().getOwner().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Only the project owner can approve leave requests");
                }

                // Lock ProjectRole before changing filledCount
                ProjectRole role = projectRoleRepository
                                .findByIdForUpdate(
                                                membership.getProjectRole().getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Project role not found"));

                // Mark membership as LEFT
                membership.setStatus(MembershipStatus.LEFT);
                if (message != null) {
                        membership.setStatusMessage(message);
                }

                // Decrement occupied position
                if (role.getFilledCount() > 0) {
                        role.setFilledCount(role.getFilledCount() - 1);
                }

                membershipRepository.save(membership);
                projectRoleRepository.save(role);
        }

        @Override
        @Transactional
        public void rejectLeave(UUID membershipId, String message) {
                // Find LEAVE_PENDING membership
                Membership membership = membershipRepository
                                .findByIdAndStatus(
                                                membershipId,
                                                MembershipStatus.LEAVE_PENDING)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Pending leave request not found"));

                // Verify current user is owner
                User currentUser = getCurrentUser();
                if (!membership.getProject().getOwner().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Only the project owner can reject leave requests");
                }

                // Mark membership as ACTIVE
                membership.setStatus(MembershipStatus.ACTIVE);
                if (message != null) {
                        membership.setStatusMessage(message);
                }

                membershipRepository.save(membership);
        }

        @Override
        @Transactional
        public void transferOwnership(
                        UUID projectId,
                        UUID newOwnerUserId,
                        String currentOwnerEmail) {

                User currentOwner = userRepository.findByEmail(currentOwnerEmail)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Current owner not found"));

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Project not found"));

                // Verify the requester is actually the current owner
                if (!project.getOwner().getId().equals(currentOwner.getId())) {
                        throw new ForbiddenException(
                                        "Only the project owner can transfer ownership");
                }

                // Cannot transfer to yourself
                if (currentOwner.getId().equals(newOwnerUserId)) {
                        throw new BadRequestException(
                                        "Cannot transfer ownership to yourself");
                }

                // The new owner must be an active member of the project
                Membership newOwnerMembership = membershipRepository
                                .findByProjectIdAndUserId(projectId, newOwnerUserId)
                                .orElseThrow(() -> new BadRequestException(
                                                "Target user is not an active member of this project"));

                if (newOwnerMembership.getStatus() != MembershipStatus.ACTIVE) {
                        throw new BadRequestException(
                                        "Target user is not an active member of this project");
                }

                // Swap the membership roles
                // Find the current owner's membership (if they have one — owner may not always have a Membership row)
                Membership currentOwnerMembership = membershipRepository
                                .findByProjectIdAndUserId(projectId, currentOwner.getId())
                                .orElse(null);

                if (currentOwnerMembership != null) {
                        currentOwnerMembership.setMembershipRole(MembershipRole.MEMBER);
                        membershipRepository.save(currentOwnerMembership);
                }

                newOwnerMembership.setMembershipRole(MembershipRole.OWNER);
                membershipRepository.save(newOwnerMembership);

                // Transfer project ownership
                User newOwner = userRepository.findById(newOwnerUserId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "New owner user not found"));

                project.setOwner(newOwner);
                projectRepository.save(project);
        }
}