package com.cobuild.backend.role;

import com.cobuild.backend.role.dto.request.CreateRoleRequest;
import com.cobuild.backend.role.dto.request.UpdateRoleRequest;
import com.cobuild.backend.role.dto.response.ProjectRoleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/roles")
public class ProjectRoleController {

    private final ProjectRoleService projectRoleService;

    public ProjectRoleController(ProjectRoleService projectRoleService) {
        this.projectRoleService = projectRoleService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectRoleResponse>> getRoles(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectRoleService.getRolesForProject(projectId));
    }

    @GetMapping("/{roleId}")
    public ResponseEntity<ProjectRoleResponse> getRole(
            @PathVariable UUID projectId,
            @PathVariable UUID roleId) {
        return ResponseEntity.ok(projectRoleService.getRoleById(roleId));
    }

    @PostMapping
    public ResponseEntity<ProjectRoleResponse> createRole(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateRoleRequest request) {
        ProjectRoleResponse created = projectRoleService.createRole(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{roleId}")
    public ResponseEntity<ProjectRoleResponse> updateRole(
            @PathVariable UUID projectId,
            @PathVariable UUID roleId,
            @Valid @RequestBody UpdateRoleRequest request) {
        ProjectRoleResponse updated = projectRoleService.updateRole(projectId, roleId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> deleteRole(
            @PathVariable UUID projectId,
            @PathVariable UUID roleId) {
        projectRoleService.deleteRole(projectId, roleId);
        return ResponseEntity.noContent().build();
    }
}