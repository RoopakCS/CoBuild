package com.cobuild.backend.project.dto.request;

import com.cobuild.backend.project.ExperienceLevel;
import com.cobuild.backend.project.ProjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
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

    // ── Project type (defaults to SIDE_PROJECT if omitted) ────
    private ProjectType projectType = ProjectType.SIDE_PROJECT;

    // ── Hackathon-specific fields (optional; ignored for SIDE_PROJECT) ──
    private LocalDate eventStartDate;

    private LocalDate eventEndDate;

    private LocalDate registrationDeadline;

    private String prizePool;

    private String organizerName;

    private String hackathonUrl;

}