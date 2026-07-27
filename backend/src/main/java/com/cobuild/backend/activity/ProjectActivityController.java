package com.cobuild.backend.activity;

import com.cobuild.backend.activity.dto.request.CreateActivityRequest;
import com.cobuild.backend.activity.dto.response.ProjectActivityResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/activities")
@RequiredArgsConstructor
public class ProjectActivityController {

    private final ProjectActivityService activityService;

    @PostMapping
    public ResponseEntity<ProjectActivityResponse> createActivity(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateActivityRequest request) {

        ProjectActivityResponse response = activityService.createActivity(projectId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProjectActivityResponse>> getProjectActivities(
            @PathVariable UUID projectId,
            Pageable pageable) {

        return ResponseEntity.ok(
                activityService.getProjectActivities(projectId, pageable)
        );
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<String> deleteActivity(
            @PathVariable UUID projectId,
            @PathVariable UUID activityId) {

        activityService.deleteActivity(projectId, activityId);
        return ResponseEntity.ok("Activity deleted successfully.");
    }
}
