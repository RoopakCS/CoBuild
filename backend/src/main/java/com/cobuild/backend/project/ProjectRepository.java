package com.cobuild.backend.project;

import com.cobuild.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository
        extends JpaRepository<Project, UUID>,
            JpaSpecificationExecutor<Project> {

    List<Project> findByOwner(User owner);

    Page<Project> findByDomainIgnoreCase(
            String domain,
            Pageable pageable);

    Page<Project> findByExperienceLevel(
            ExperienceLevel experienceLevel,
            Pageable pageable);


    Page<Project> findByStatus(
            ProjectStatus status,
            Pageable pageable);

    Page<Project> findByTitleContainingIgnoreCase(
            String title,
            Pageable pageable);
}