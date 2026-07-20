package com.cobuild.backend.role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectRoleRepository extends JpaRepository<ProjectRole, UUID> {
    // No custom query methods yet — Phase 2 will add things like
    // findByProjectId(UUID projectId) once the service layer needs them.
}