package com.cobuild.backend.application;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<ProjectApplication, UUID>{
    List<ProjectApplication> findByProjectId(UUID projectId);

    List<ProjectApplication> findByApplicantId(UUID applicantId);

    boolean existsByProjectIdAndApplicantId(UUID projectId, UUID applicantId);
}
