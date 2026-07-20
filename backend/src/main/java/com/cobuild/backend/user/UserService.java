package com.cobuild.backend.user;

import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.dto.request.UpdateProfileRequest;
import com.cobuild.backend.user.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated user's profile.
     */
    public UserResponse getCurrentUser() {

        User user = getAuthenticatedUser();

        return mapToResponse(user);
    }

    /**
     * Updates the currently authenticated user's profile.
     */
    public UserResponse updateProfile(UpdateProfileRequest request) {

        User user = getAuthenticatedUser();

        user.setBio(request.getBio());
        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setGithubUrl(request.getGithubUrl());
        user.setLinkedinUrl(request.getLinkedinUrl());

        if (request.getExperienceLevel() != null) {
            user.setExperienceLevel(request.getExperienceLevel());
        }

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }

    /**
     * Returns a user's public profile by ID.
     */
    public UserResponse getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToResponse(user);
    }

    /**
     * Gets the authenticated user from Spring Security.
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

        User user = userPrincipal.getUser();

        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        return user;
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
}