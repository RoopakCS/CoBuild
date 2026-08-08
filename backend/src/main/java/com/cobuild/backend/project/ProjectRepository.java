package com.cobuild.backend.project;

import com.cobuild.backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository
        extends JpaRepository<Project, UUID>,
            JpaSpecificationExecutor<Project> {

    /**
     * Overrides the base JpaSpecificationExecutor.findAll so that every
     * paginated list query eagerly fetches owner and roles via a JOIN,
     * then roles.skills in a second batched query via @BatchSize(size=20).
     * This avoids both N+1 and Hibernate's MultipleBagFetchException.
     */
    @EntityGraph(attributePaths = {"owner", "roles"})
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "roles"})
    Optional<Project> findWithDetailsById(UUID id);

    @EntityGraph(attributePaths = {"owner", "roles"})
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