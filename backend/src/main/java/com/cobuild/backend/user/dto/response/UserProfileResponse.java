package com.cobuild.backend.user.dto.response;

import com.cobuild.backend.project.dto.response.ProjectResponse;
import com.cobuild.backend.user.ExperienceLevel;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {

    private UUID id;

    private String name;

    private String email;

    private String bio;

    private String profileImageUrl;

    private String githubUrl;

    private String linkedinUrl;

    private ExperienceLevel experienceLevel;

    private List<String> skills;

    // Projects created by the user
    private List<ProjectResponse> createdProjects;

    // Projects the user collaborates on
    private List<ProjectResponse> collaboratedProjects;
}