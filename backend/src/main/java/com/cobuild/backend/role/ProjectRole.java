package com.cobuild.backend.role;

import com.cobuild.backend.project.Project;
import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project_roles")
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

    @OneToMany(mappedBy = "role")
    private List<RoleSkill> skills;

    @PrePersist
    @PreUpdate
    private void validateCounts() {
        if (filledCount > openingsCount) {
            throw new IllegalStateException("filledCount cannot exceed openingsCount");
        }
    }

    // getters/setters
}