package com.cobuild.backend.role;

import com.cobuild.backend.role.dto.request.CreateRoleRequest;
import com.cobuild.backend.role.dto.request.UpdateRoleRequest;
import com.cobuild.backend.role.dto.response.ProjectRoleResponse;

import java.util.List;
import java.util.UUID;

public interface ProjectRoleService {

    /**
     * Create a new role under a project.
     */
    ProjectRoleResponse createRole(UUID projectId, CreateRoleRequest request);

    /**
     * Update an existing role's details (title, description, openingsCount, skills).
     */
    ProjectRoleResponse updateRole(UUID projectId, UUID roleId, UpdateRoleRequest request);

    /**
     * Delete a role. Should be blocked if the role has active applications/members —
     * enforce that check in the impl.
     */
    void deleteRole(UUID projectId, UUID roleId);

    /**
     * List all roles for a given project.
     */
    List<ProjectRoleResponse> getRolesForProject(UUID projectId);

    /**
     * Fetch a single role by id (used internally by ApplicationServiceImpl for
     * capacity checks — M2 will call this).
     */
    ProjectRoleResponse getRoleById(UUID roleId);

    /**
     * Increment filledCount by 1 when an application is accepted.
     * Returns true if the role just became full (filledCount == openingsCount)
     * so the caller (M2) knows to trigger auto-reject of remaining PENDING apps.
     */
    boolean incrementFilledCount(UUID roleId);

    /**
     * Decrement filledCount by 1 when a member leaves/is removed.
     */
    void decrementFilledCount(UUID roleId);
}