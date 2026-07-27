package com.cobuild.backend.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectWorkspaceLinkRepository
        extends JpaRepository<ProjectWorkspaceLink, UUID> {

    List<ProjectWorkspaceLink> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

}
