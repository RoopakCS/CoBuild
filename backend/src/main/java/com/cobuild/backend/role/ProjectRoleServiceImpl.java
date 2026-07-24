package com.cobuild.backend.role;

import com.cobuild.backend.role.dto.request.CreateRoleRequest;
import com.cobuild.backend.role.dto.request.UpdateRoleRequest;
import com.cobuild.backend.role.dto.response.ProjectRoleResponse;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.exception.BadRequestException;
import com.cobuild.backend.exception.ForbiddenException;

@Service
@Transactional(readOnly = true)
public class ProjectRoleServiceImpl implements ProjectRoleService {

    private final ProjectRoleRepository projectRoleRepository;
    private final RoleSkillRepository roleSkillRepository;
    private final ProjectRepository projectRepository;

    public ProjectRoleServiceImpl(ProjectRoleRepository projectRoleRepository,
                                  RoleSkillRepository roleSkillRepository,
                                  ProjectRepository projectRepository) {
        this.projectRoleRepository = projectRoleRepository;
        this.roleSkillRepository = roleSkillRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public ProjectRoleResponse createRole(UUID projectId, CreateRoleRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));

        User currentUser = getCurrentUser();
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the project owner can create roles");
        }

        if (request.getOpeningsCount() < 1) {
            throw new IllegalArgumentException("openingsCount must be at least 1");
        }

        ProjectRole role = new ProjectRole();
        role.setProject(project);
        role.setTitle(request.getTitle());
        role.setDescription(request.getDescription());
        role.setOpeningsCount(request.getOpeningsCount());
        role.setFilledCount(0);

        ProjectRole saved = projectRoleRepository.save(role);

        if (request.getSkills() != null) {
            List<RoleSkill> skills = request.getSkills().stream()
                    .map(name -> new RoleSkill(saved, name))
                    .collect(Collectors.toList());
            roleSkillRepository.saveAll(skills);
            saved.setSkills(skills);
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProjectRoleResponse updateRole(UUID projectId, UUID roleId, UpdateRoleRequest request) {
        ProjectRole role = getRoleOrThrow(roleId);
        validateBelongsToProject(role, projectId);

        User currentUser = getCurrentUser();
        if (!role.getProject().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the project owner can update roles");
        }

        if (request.getTitle() != null) {
            role.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getOpeningsCount() != null) {
            if (request.getOpeningsCount() < 1) {
                throw new IllegalArgumentException("openingsCount must be at least 1");
            }
            if (request.getOpeningsCount() < role.getFilledCount()) {
                throw new IllegalArgumentException(
                        "openingsCount cannot be less than current filledCount (" + role.getFilledCount() + ")");
            }
            role.setOpeningsCount(request.getOpeningsCount());
        }

        if (request.getSkills() != null) {
            roleSkillRepository.deleteAll(role.getSkills());
            List<RoleSkill> newSkills = request.getSkills().stream()
                    .map(name -> new RoleSkill(role, name))
                    .collect(Collectors.toList());
            roleSkillRepository.saveAll(newSkills);
            role.setSkills(newSkills);
        }

        ProjectRole saved = projectRoleRepository.save(role);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRole(UUID projectId, UUID roleId) {
        ProjectRole role = getRoleOrThrow(roleId);
        validateBelongsToProject(role, projectId);

        User currentUser = getCurrentUser();
        if (!role.getProject().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Only the project owner can delete roles");
        }

        if (role.getFilledCount() > 0) {
            throw new BadRequestException(
                    "Cannot delete a role with active members. Remove members first.");
        }

        // Check for pending applications on this role
        if (role.getApplications() != null && role.getApplications().stream()
                .anyMatch(app -> app.getStatus() == com.cobuild.backend.application.ApplicationStatus.PENDING)) {
            throw new BadRequestException(
                    "Cannot delete a role with pending applications. Reject or withdraw them first.");
        }

        roleSkillRepository.deleteAll(role.getSkills());
        projectRoleRepository.delete(role);
    }

    @Override
    public List<ProjectRoleResponse> getRolesForProject(UUID projectId) {
        return projectRoleRepository.findByProjectId(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectRoleResponse getRoleById(UUID roleId) {
        return toResponse(getRoleOrThrow(roleId));
    }

    @Override
    @Transactional
    public boolean incrementFilledCount(UUID roleId) {
        ProjectRole role = getRoleOrThrow(roleId);
        if (role.getFilledCount() >= role.getOpeningsCount()) {
            throw new BadRequestException("Role is already full: " + roleId);
        }
        role.setFilledCount(role.getFilledCount() + 1);
        projectRoleRepository.save(role);
        return role.getFilledCount() == role.getOpeningsCount();
    }

    @Override
    @Transactional
    public void decrementFilledCount(UUID roleId) {
        ProjectRole role = getRoleOrThrow(roleId);
        if (role.getFilledCount() > 0) {
            role.setFilledCount(role.getFilledCount() - 1);
            projectRoleRepository.save(role);
        }
    }

    // ----- Helpers -----

    private ProjectRole getRoleOrThrow(UUID roleId) {
        return projectRoleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + roleId));
    }

    private void validateBelongsToProject(ProjectRole role, UUID projectId) {
        if (!role.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Role does not belong to the given project");
        }
    }

    private ProjectRoleResponse toResponse(ProjectRole role) {
        List<String> skillNames = role.getSkills() == null
                ? List.of()
                : role.getSkills().stream().map(RoleSkill::getSkillName).collect(Collectors.toList());

        return new ProjectRoleResponse(
                role.getId(),
                role.getProject().getId(),
                role.getTitle(),
                role.getDescription(),
                role.getOpeningsCount(),
                role.getFilledCount(),
                role.getFilledCount() >= role.getOpeningsCount(),
                skillNames
        );

    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Unauthorized");
        }
        return userPrincipal.getUser();
    }
}