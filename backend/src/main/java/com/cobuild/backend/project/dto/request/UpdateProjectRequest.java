package com.cobuild.backend.project.dto.request;

import com.cobuild.backend.project.ExperienceLevel;
import com.cobuild.backend.project.ProjectStatus;
import com.cobuild.backend.project.ProjectType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateProjectRequest {

    private String title;

    private String description;

    private String domain;

    private ExperienceLevel experienceLevel;

    private ProjectStatus status;

    private Integer teamSize;

    private String commitment;

    private String repositoryUrl;

    private List<String> skills;

    // ── Project type ─────────────────────────────────────────
    private ProjectType projectType;

    // ── Hackathon-specific fields (optional) ─────────────────
    private LocalDate eventStartDate;

    private LocalDate eventEndDate;

    private LocalDate registrationDeadline;

    private String prizePool;

    private String organizerName;

    private String hackathonUrl;

}