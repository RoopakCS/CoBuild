package com.cobuild.backend.membership;

import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.membership.dto.request.AddMemberRequest;
import com.cobuild.backend.membership.dto.response.MembershipResponse;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public MembershipResponse addMember(AddMemberRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "Only the project owner can add members");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (membershipRepository.existsByUserAndProject(user, project)) {
            throw new DuplicateResourceException(
                    "User is already a member of this project");
        }

        Membership membership = Membership.builder()
                .user(user)
                .project(project)
                .role(MembershipRole.MEMBER)
                .status(MembershipStatus.ACTIVE)
                .build();

        return mapToResponse(membershipRepository.save(membership));
    }

    @Override
    public List<MembershipResponse> getProjectMembers(UUID projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        return membershipRepository.findByProject(project)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MembershipResponse> getUserMemberships(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return membershipRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void removeMember(UUID projectId, UUID userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "Only the project owner can remove members");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Membership membership = membershipRepository
                .findByUserAndProject(user, project)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Membership not found"));

        membershipRepository.delete(membership);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

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
                .role(membership.getRole())
                .status(membership.getStatus())
                .joinedAt(membership.getJoinedAt())
                .build();
    }
}