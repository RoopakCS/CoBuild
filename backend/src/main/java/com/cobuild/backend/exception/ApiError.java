package com.cobuild.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ApiError {

    private LocalDateTime timestamp;

    private int status;

    private String error;

    private String message;

    private String path;

    private List<String> validationErrors;

}