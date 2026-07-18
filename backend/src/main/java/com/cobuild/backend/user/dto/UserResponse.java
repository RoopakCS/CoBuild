package com.cobuild.backend.user.dto;

import com.cobuild.backend.user.ExperienceLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private UUID id;

    private String name;

    private String email;

    private String bio;

    private String profileImageUrl;

    private String githubUrl;

    private String linkedinUrl;

    private ExperienceLevel experienceLevel;

    private LocalDateTime createdAt;

}