package com.cobuild.backend.project;

import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.project.dto.request.CreateProjectRequest;
import com.cobuild.backend.project.dto.request.UpdateProjectRequest;
import com.cobuild.backend.project.dto.response.ProjectResponse;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cobuild.backend.project.dto.response.ProjectRoleResponse;
import com.cobuild.backend.role.RoleSkill;

import com.cobuild.backend.project.ProjectSpecification;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {

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

        return projectMapper.toResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(UUID id) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        return projectMapper.toResponse(project);
    }

    @Override
    public Page<ProjectResponse> getAllProjects(
            String search,
            String domain,
            ExperienceLevel experienceLevel,
            ProjectStatus status,
            List<String> skills,
            Pageable pageable) {

        return projectRepository.findAll(
                        ProjectSpecification.withFilters(
                                search,
                                domain,
                                experienceLevel,
                                status,
                                skills
                        ),
                        pageable
                )
                .map(projectMapper::toResponse);
    }
    @Override
    @Transactional
    public ProjectResponse updateProject(
            UUID id,
            UpdateProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        User currentUser = getCurrentUser();

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You are not allowed to update another user's project");
        }

        if (request.getTitle() != null)
            project.setTitle(request.getTitle());

        if (request.getDescription() != null)
            project.setDescription(request.getDescription());

        if (request.getDomain() != null)
            project.setDomain(request.getDomain());

        if (request.getExperienceLevel() != null)
            project.setExperienceLevel(request.getExperienceLevel());

        if (request.getStatus() != null)
            project.setStatus(request.getStatus());

        if (request.getTeamSize() != null)
            project.setTeamSize(request.getTeamSize());

        if (request.getCommitment() != null)
            project.setCommitment(request.getCommitment());

        if (request.getRepositoryUrl() != null)
            project.setRepositoryUrl(request.getRepositoryUrl());

        Project updatedProject = projectRepository.save(project);

        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
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
                        new ResourceNotFoundException("User not found"));

        return projectRepository.findByOwner(owner)
                .stream()
                .map(projectMapper::toResponse)
                .toList();
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Unauthorized");
        }

        return userPrincipal.getUser();
    }

//    private ProjectResponse mapToResponse(Project project) {
//
//        User owner = project.getOwner();
//
//        List<ProjectRoleResponse> roleResponses = List.of();
//        boolean isFull = false;
//
//        if (project.getRoles() != null) {
//
//            roleResponses = project.getRoles()
//                    .stream()
//                    .map(role -> ProjectRoleResponse.builder()
//                            .id(role.getId())
//                            .title(role.getTitle())
//                            .description(role.getDescription())
//                            .openingsCount(role.getOpeningsCount())
//                            .filledCount(role.getFilledCount())
//                            .skills(
//                                    role.getSkills()
//                                            .stream()
//                                            .map(RoleSkill::getSkillName)
//                                            .toList()
//                            )
//                            .build())
//                    .toList();
//
//            isFull = project.getRoles()
//                    .stream()
//                    .allMatch(role ->
//                            role.getFilledCount() >= role.getOpeningsCount());
//        }
//
//        return ProjectResponse.builder()
//                .id(project.getId())
//                .title(project.getTitle())
//                .description(project.getDescription())
//                .domain(project.getDomain())
//                .experienceLevel(project.getExperienceLevel())
//                .status(project.getStatus())
//                .teamSize(project.getTeamSize())
//                .commitment(project.getCommitment())
//                .repositoryUrl(project.getRepositoryUrl())
//                .ownerId(owner != null ? owner.getId() : null)
//                .ownerName(owner != null ? owner.getName() : null)
//
//                // Existing field
//                .skills(
//                        roleResponses.stream()
//                                .flatMap(role -> role.getSkills().stream())
//                                .distinct()
//                                .toList()
//                )
//
//                // New fields
//                .roles(roleResponses)
//                .isFull(isFull)
//
//                .createdAt(project.getCreatedAt())
//                .updatedAt(project.getUpdatedAt())
//                .build();
//    }
}