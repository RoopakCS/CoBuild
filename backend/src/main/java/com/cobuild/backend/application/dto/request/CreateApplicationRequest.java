package com.cobuild.backend.application.dto.request;

import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
    @Size(
        max = 1000,
        message = "Application message cannot exceed 1000 characters"
    )
    String message
) {
    
}
