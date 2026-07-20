package com.cobuild.backend.project.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectRoleResponse {

    private UUID id;

    private String title;

    private String description;

    private int openingsCount;

    private int filledCount;

    private List<String> skills;
}