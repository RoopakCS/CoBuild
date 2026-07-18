package com.cobuild.backend.project;

import lombok.Data;

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

}