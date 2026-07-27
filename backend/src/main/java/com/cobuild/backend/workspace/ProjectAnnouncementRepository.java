package com.cobuild.backend.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectAnnouncementRepository
        extends JpaRepository<ProjectAnnouncement, UUID> {

    List<ProjectAnnouncement> findByProjectIdOrderByIsPinnedDescCreatedAtDesc(UUID projectId);

}
