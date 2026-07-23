package com.cobuild.backend.application;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<ProjectApplication, UUID> {
    List<ProjectApplication> findByProjectId(UUID projectId);

    List<ProjectApplication> findByApplicantId(UUID applicantId);

    boolean existsByProjectIdAndApplicantIdAndStatusIn(UUID projectId, UUID applicantId, List<ApplicationStatus> statuses);

    java.util.Optional<ProjectApplication> findByProjectIdAndApplicantId(UUID projectId, UUID applicantId);

    List<ProjectApplication> findByRoleIdAndStatus(UUID roleId, ApplicationStatus status);
}
