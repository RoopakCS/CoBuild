package com.cobuild.backend.project;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectResponse {

    private UUID id;

    private String title;

    private String description;

    private String domain;

    private ExperienceLevel experienceLevel;

    private ProjectStatus status;

    private Integer teamSize;

    private String commitment;

    private String repositoryUrl;

    private UUID ownerId;

    private String ownerName;

    private List<String> skills;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}