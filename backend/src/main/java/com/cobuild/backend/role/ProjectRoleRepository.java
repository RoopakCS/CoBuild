package com.cobuild.backend.role;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, UUID> {
    List<ProjectRole> findByProjectId(UUID projectId);
}