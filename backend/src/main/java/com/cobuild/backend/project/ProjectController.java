package com.cobuild.backend.project;

import com.cobuild.backend.project.dto.request.CreateProjectRequest;
import com.cobuild.backend.project.dto.request.UpdateProjectRequest;
import com.cobuild.backend.project.dto.response.ProjectResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Create Project
     */
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectResponse response = projectService.createProject(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get All Projects
     */
    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getAllProjects(

            @RequestParam(required = false) String search,

            @RequestParam(required = false) String domain,

            @RequestParam(required = false)
            ExperienceLevel experienceLevel,

            @RequestParam(required = false)
            ProjectStatus status,

            @RequestParam(required = false)
            List<String> skills,

            Pageable pageable) {

        return ResponseEntity.ok(
                projectService.getAllProjects(
                        search,
                        domain,
                        experienceLevel,
                        status,
                        skills,
                        pageable
                )
        );
    }

    /**
     * Get Project By id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                projectService.getProjectById(id)
        );
    }

    /**
     * Update Project
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {

        return ResponseEntity.ok(
                projectService.updateProject(id, request)
        );
    }

    /**
     * Delete Project
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(
            @PathVariable UUID id) {

        projectService.deleteProject(id);

        return ResponseEntity.ok("Project deleted successfully.");

    }

    /**
     * Get Projects By Owner
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByOwner(
            @PathVariable UUID ownerId) {

        return ResponseEntity.ok(
                projectService.getProjectsByOwner(ownerId)
        );

    }

}