package com.cobuild.backend.membership.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class AddMemberRequest {

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "User ID is required")
    private UUID userId;

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}