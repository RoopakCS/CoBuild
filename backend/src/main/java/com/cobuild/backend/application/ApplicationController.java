package com.cobuild.backend.application;

import com.cobuild.backend.application.dto.response.ApplicationResponse;
import com.cobuild.backend.application.dto.request.CreateApplicationRequest;
import com.cobuild.backend.application.dto.request.UpdateApplicationStatusRequest;
import com.cobuild.backend.security.RateLimitingService;
import com.cobuild.backend.exception.TooManyRequestsException;
import io.github.bucket4j.Bucket;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class ApplicationController {
    private final ApplicationService applicationService;
    private final RateLimitingService rateLimitingService;

    // To create an appplication
    @PostMapping("/projects/{projectId}/applications")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateApplicationRequest request,
            Authentication authentication) {
            
        Bucket bucket = rateLimitingService.resolveBucket(authentication.getName());
        if (!bucket.tryConsume(1)) {
            throw new TooManyRequestsException("You have exceeded the maximum number of applications allowed per minute.");
        }
            
        ApplicationResponse response = applicationService.apply(projectId, authentication.getName(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // To return all the applications for a specific project
    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getProjectApplications(
            @PathVariable UUID projectId, Authentication authentication) {
        List<ApplicationResponse> applications = applicationService.getProjectApplications(projectId,
                authentication.getName());

        return ResponseEntity.ok(applications);
    }

    // To return all the applications that the user has applied for
    @GetMapping("/users/me/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            Authentication authentication) {
        List<ApplicationResponse> applications = applicationService.getUserApplications(authentication.getName());

        return ResponseEntity.ok(applications);
    }

    // TO accept/reject an application
    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication) {
        ApplicationResponse response = applicationService.updateStatus(applicationId, request.status(), authentication.getName());

        return ResponseEntity.ok(response);
    }

    // To withdraw an application
    @PatchMapping("/applications/{applicationId}/withdraw")
    public ResponseEntity<ApplicationResponse> withdrawApplcation(@PathVariable UUID applicationId, Authentication authentication) {
        ApplicationResponse response = applicationService.withdrawApplication(applicationId, authentication.getName());

        return ResponseEntity.ok(response);
    }
}
