package com.cobuild.backend.project;

import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.project.dto.request.CreateProjectRequest;
import com.cobuild.backend.project.dto.request.UpdateProjectRequest;
import com.cobuild.backend.project.dto.response.ProjectResponse;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {

        // Temporary Owner
        // Replace this with Logged In User after JWT

        User owner = getCurrentUser();

        Project project = Project.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .domain(request.getDomain())
                .experienceLevel(request.getExperienceLevel())
                .teamSize(request.getTeamSize())
                .commitment(request.getCommitment())
                .repositoryUrl(request.getRepositoryUrl())
                .status(ProjectStatus.OPEN)
                .build();

        Project savedProject = projectRepository.save(project);

        return mapToResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(UUID id) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found"));

        return mapToResponse(project);
    }

    @Override
    public Page<ProjectResponse> getAllProjects(Pageable pageable) {

        return projectRepository.findAll(pageable)
                .map(this::mapToResponse);

    }

    @Override
    public ProjectResponse updateProject(UUID id,
                                         UpdateProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You are not allowed to update another user's project");
        }

        if (request.getTitle() != null) {
            project.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        if (request.getDomain() != null) {
            project.setDomain(request.getDomain());
        }

        if (request.getExperienceLevel() != null) {
            project.setExperienceLevel(request.getExperienceLevel());
        }

        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        if (request.getTeamSize() != null) {
            project.setTeamSize(request.getTeamSize());
        }

        if (request.getCommitment() != null) {
            project.setCommitment(request.getCommitment());
        }

        if (request.getRepositoryUrl() != null) {
            project.setRepositoryUrl(request.getRepositoryUrl());
        }

        Project updated = projectRepository.save(project);

        return mapToResponse(updated);

    }

    @Override
    public void deleteProject(UUID id) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You are not allowed to delete another user's project");
        }

        projectRepository.delete(project);

    }

    @Override
    public List<ProjectResponse> getProjectsByOwner(UUID ownerId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        return projectRepository.findByOwner(owner)
                .stream()
                .map(this::mapToResponse)
                .toList();

    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private ProjectResponse mapToResponse(Project project){

        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .domain(project.getDomain())
                .experienceLevel(project.getExperienceLevel())
                .status(project.getStatus())
                .teamSize(project.getTeamSize())
                .commitment(project.getCommitment())
                .repositoryUrl(project.getRepositoryUrl())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getName())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();

    }

}