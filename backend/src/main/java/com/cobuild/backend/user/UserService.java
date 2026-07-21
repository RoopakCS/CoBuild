package com.cobuild.backend.user;

import com.cobuild.backend.membership.MembershipRepository;
import com.cobuild.backend.project.ProjectMapper;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.dto.request.UpdateProfileRequest;
import com.cobuild.backend.user.dto.response.UserProfileResponse;
import com.cobuild.backend.user.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.cobuild.backend.membership.Membership;
import com.cobuild.backend.membership.MembershipStatus;
import com.cobuild.backend.project.dto.response.ProjectResponse;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    private final ProjectRepository projectRepository;

    private final MembershipRepository membershipRepository;

    private final ProjectMapper projectMapper;

    /**
     * Returns the currently authenticated user's profile.
     */
    public UserProfileResponse getCurrentUserProfile() {

        User user = getAuthenticatedUser();

        return mapToProfileResponse(user);
    }

    /**
     * Updates the currently authenticated user's profile.
     */
    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {

        User user = getAuthenticatedUser();

        user.setBio(request.getBio());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());

        if (request.getExperienceLevel() != null) {
            user.setExperienceLevel(request.getExperienceLevel());
        }

        User updatedUser = userRepository.save(user);

        return mapToProfileResponse(updatedUser);
    }

    /**
     * Returns a user's public profile by ID.
     */
    public UserProfileResponse getUserProfile(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToProfileResponse(user);
    }

    /**
     * Gets the authenticated user from Spring Security.
     * Re-fetches from DB so the entity is managed by the current Hibernate session.
     */
    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new RuntimeException("Invalid authentication principal");
        }

        User principalUser = userPrincipal.getUser();

        if (principalUser == null || principalUser.getId() == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        // Re-fetch from DB so the entity is attached to the current session
        return userRepository.findById(principalUser.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    /**
     * Converts User entity to UserResponse DTO.
     */
    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .experienceLevel(user.getExperienceLevel())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserProfileResponse mapToProfileResponse(User user) {

        List<ProjectResponse> createdProjects = projectRepository
                .findByOwner(user)
                .stream()
                .map(projectMapper::toResponse)
                .toList();

        List<ProjectResponse> collaboratedProjects = membershipRepository
                .findByUserAndStatus(user, MembershipStatus.ACTIVE)
                .stream()
                .map(Membership::getProject)
                .map(projectMapper::toResponse)
                .toList();

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profileImageUrl(user.getProfileImageUrl())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .experienceLevel(user.getExperienceLevel())
                .skills(user.getSkills())
                .createdProjects(createdProjects)
                .collaboratedProjects(collaboratedProjects)
                .build();
    }
}