package com.cobuild.backend.project;

import com.cobuild.backend.role.ProjectRole;
import java.util.List;

import com.cobuild.backend.membership.Membership;
import com.cobuild.backend.application.ProjectApplication;
import com.cobuild.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.OPEN;

    @Column(nullable = false)
    private Integer teamSize;

    @Column(nullable = false)
    private String commitment;

    private String repositoryUrl;

    // ── Project type ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectType projectType = ProjectType.SIDE_PROJECT;

    // ── Hackathon-specific fields (null for SIDE_PROJECT) ────
    private LocalDate eventStartDate;

    private LocalDate eventEndDate;

    private LocalDate registrationDeadline;

    private String prizePool;

    private String organizerName;

    @Column(length = 500)
    private String hackathonUrl;

    // ─────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<ProjectRole> roles;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<Membership> memberships;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private List<ProjectApplication> applications;

}