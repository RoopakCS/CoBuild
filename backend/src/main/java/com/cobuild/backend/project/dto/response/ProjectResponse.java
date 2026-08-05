package com.cobuild.backend.project.dto.response;

import com.cobuild.backend.project.ExperienceLevel;
import com.cobuild.backend.project.ProjectStatus;
import com.cobuild.backend.project.ProjectType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
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

    // Existing field
    private List<String> skills;

    // NEW
    private List<ProjectRoleResponse> roles;

    // NEW
    private boolean isFull;

    // ── Project type ─────────────────────────────────────────
    private ProjectType projectType;

    // ── Hackathon-specific fields (null for SIDE_PROJECT) ────
    private LocalDate eventStartDate;

    private LocalDate eventEndDate;

    private LocalDate registrationDeadline;

    private String prizePool;

    private String organizerName;

    private String hackathonUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}