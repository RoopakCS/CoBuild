package com.cobuild.backend.application;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cobuild.backend.application.dto.ApplicationResponse;
import com.cobuild.backend.application.dto.CreateApplicationRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;

    @PostMapping("/projects/{projectId}/applications")
    public ResponseEntity<ApplicationResponse> apply(@PathVariable UUID projectId, @RequestParam UUID applicantId,
            @Valid @RequestBody CreateApplicationRequest request) {
        ApplicationResponse response = applicationService.apply(projectId, applicantId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getProjectApplications(@PathVariable UUID projectId) {
        List<ApplicationResponse> applications = applicationService.getProjectApplications(projectId);

        return ResponseEntity.ok(applications);
    }

    
}
