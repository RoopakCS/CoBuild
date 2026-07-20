package com.cobuild.backend.application.dto.request;

import com.cobuild.backend.application.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(
    @NotNull(message = "Application status is required")
    ApplicationStatus status
) {
    
}
