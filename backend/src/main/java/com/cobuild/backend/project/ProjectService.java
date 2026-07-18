package com.cobuild.backend.project;

import com.cobuild.backend.project.dto.request.CreateProjectRequest;
import com.cobuild.backend.project.dto.request.UpdateProjectRequest;
import com.cobuild.backend.project.dto.response.ProjectResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    ProjectResponse createProject(CreateProjectRequest request);

    ProjectResponse getProjectById(UUID id);

    Page<ProjectResponse> getAllProjects(Pageable pageable);

    ProjectResponse updateProject(UUID id,
                                  UpdateProjectRequest request);

    void deleteProject(UUID id);

    List<ProjectResponse> getProjectsByOwner(UUID ownerId);

}