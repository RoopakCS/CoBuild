package com.cobuild.backend.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotNull(message = "Experience Level is required")
    private ExperienceLevel experienceLevel;

    @NotNull(message = "Team Size is required")
    private Integer teamSize;

    @NotBlank(message = "Commitment is required")
    private String commitment;

    private String repositoryUrl;

    private List<String> skills;

}