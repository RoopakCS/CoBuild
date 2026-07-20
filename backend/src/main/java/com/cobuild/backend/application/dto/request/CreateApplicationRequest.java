package com.cobuild.backend.application.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
        @Size(max = 1000, message = "Application message cannot exceed 1000 characters") String message,

        @NotNull(message = "Role ID is required") UUID roleId) {

}
