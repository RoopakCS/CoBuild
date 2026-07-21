package com.cobuild.backend.role;

import com.cobuild.backend.project.Project;
import com.cobuild.backend.application.ProjectApplication;
import com.cobuild.backend.membership.Membership;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_roles")
@Getter
@Setter
@NoArgsConstructor
public class ProjectRole {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "openings_count", nullable = false)
    private int openingsCount;

    @Column(name = "filled_count", nullable = false)
    private int filledCount = 0;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoleSkill> skills;

    @OneToMany(mappedBy = "projectRole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Membership> memberships;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectApplication> applications;

    @PrePersist
    @PreUpdate
    private void validateCounts() {
        if (filledCount > openingsCount) {
            throw new IllegalStateException("filledCount cannot exceed openingsCount");
        }
    }
}