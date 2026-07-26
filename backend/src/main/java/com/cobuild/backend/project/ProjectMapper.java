package com.cobuild.backend.project;

import com.cobuild.backend.project.dto.response.ProjectResponse;
import com.cobuild.backend.project.dto.response.ProjectRoleResponse;
import com.cobuild.backend.role.RoleSkill;
import com.cobuild.backend.user.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {

        User owner = project.getOwner();

        List<ProjectRoleResponse> roleResponses = List.of();
        boolean isFull = false;

        if (project.getRoles() != null) {

            roleResponses = project.getRoles()
                    .stream()
                    .map(role -> ProjectRoleResponse.builder()
                            .id(role.getId())
                            .title(role.getTitle())
                            .description(role.getDescription())
                            .openingsCount(role.getOpeningsCount())
                            .filledCount(role.getFilledCount())
                            .isFull(role.getFilledCount() >= role.getOpeningsCount())
                            .skills(
                                    role.getSkills()
                                            .stream()
                                            .map(RoleSkill::getSkillName)
                                            .toList()
                            )
                            .build())
                    .toList();

            isFull = project.getRoles()
                    .stream()
                    .allMatch(role ->
                            role.getFilledCount() >= role.getOpeningsCount());
        }

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
                .ownerId(owner != null ? owner.getId() : null)
                .ownerName(owner != null ? owner.getName() : null)
                .skills(
                        roleResponses.stream()
                                .flatMap(role -> role.getSkills().stream())
                                .distinct()
                                .toList()
                )
                .roles(roleResponses)
                .isFull(isFull)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}