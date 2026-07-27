package com.cobuild.backend.activity;

import com.cobuild.backend.activity.dto.request.CreateActivityRequest;
import com.cobuild.backend.activity.dto.response.ProjectActivityResponse;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.membership.Membership;
import com.cobuild.backend.membership.MembershipRepository;
import com.cobuild.backend.membership.MembershipStatus;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProjectActivityService {

    private final ProjectActivityRepository activityRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Transactional
    public ProjectActivityResponse createActivity(UUID projectId, CreateActivityRequest request) {
        User currentUser = getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // 1. SECURITY CHECK: Are they the owner?
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        if (!isOwner) {
            // 2. SECURITY CHECK: If not the owner, are they an active team member?
            Membership membership = membershipRepository.findByProjectIdAndUserId(projectId, currentUser.getId())
                    .orElseThrow(() -> new ForbiddenException("You must be an active member to post an activity"));

            if (membership.getStatus() != MembershipStatus.ACTIVE && membership.getStatus() != MembershipStatus.LEAVE_PENDING) {
                throw new ForbiddenException("You must be an active member to post an activity");
            }
        }

        // 3. CREATE AND SAVE
        ProjectActivity activity = ProjectActivity.builder()
                .project(project)
                .author(currentUser)
                .content(request.getContent())
                .build();

        ProjectActivity savedActivity = activityRepository.save(activity);
        log.info("User {} created an activity for project {}", currentUser.getEmail(), projectId);

        return mapToResponse(savedActivity);
    }

    public Page<ProjectActivityResponse> getProjectActivities(UUID projectId, Pageable pageable) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found");
        }

        // Fetch from DB and map each Entity to our Response DTO
        return activityRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public void deleteActivity(UUID projectId, UUID activityId) {
        User currentUser = getCurrentUser();

        ProjectActivity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));

        if (!activity.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Activity not found in this project");
        }

        // Only the person who wrote it, OR the owner of the project, can delete it
        boolean isOwner = activity.getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAuthor = activity.getAuthor().getId().equals(currentUser.getId());

        if (!isOwner && !isAuthor) {
            log.warn("User {} attempted to delete activity {}", currentUser.getEmail(), activityId);
            throw new ForbiddenException("You are not authorized to delete this activity");
        }

        activityRepository.delete(activity);
    }

    // Helper method to convert Entity -> DTO
    private ProjectActivityResponse mapToResponse(ProjectActivity activity) {
        return ProjectActivityResponse.builder()
                .id(activity.getId())
                .projectId(activity.getProject().getId())
                .authorId(activity.getAuthor().getId())
                .authorName(activity.getAuthor().getName())
                .authorProfileImageUrl(activity.getAuthor().getProfileImageUrl())
                .content(activity.getContent())
                .createdAt(activity.getCreatedAt())
                .updatedAt(activity.getUpdatedAt())
                .build();
    }

    // Helper method to get the logged-in user securely
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Unauthorized");
        }
        return userRepository.findById(userPrincipal.getUser().getId())
                .orElseThrow(() -> new ForbiddenException("Unauthorized"));
    }
}