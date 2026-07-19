package com.cobuild.backend.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cobuild.backend.application.ApplicationStatus;

public record ApplicationResponse(
    UUID id, 
    UUID projectId,
    UUID applicantId,
    String applicantName,
    String message,
    ApplicationStatus status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    
}
