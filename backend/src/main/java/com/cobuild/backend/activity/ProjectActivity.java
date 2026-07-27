
    package com.cobuild.backend.activity;
    
    import com.cobuild.backend.project.Project;
    import com.cobuild.backend.user.User;
    import jakarta.persistence.*;
    import lombok.*;
    import org.hibernate.annotations.CreationTimestamp;
    import org.hibernate.annotations.UpdateTimestamp;
    
    import java.time.LocalDateTime;
    import java.util.UUID;
    
    @Entity
    @Table(name = "project_activities")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class ProjectActivity {
    
        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private UUID id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "project_id", nullable = false)
        private Project project;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "author_id", nullable = false)
        private User author;
    
        @Column(columnDefinition = "TEXT", nullable = false)
        private String content;
    
        @CreationTimestamp
        @Column(nullable = false, updatable = false)
        private LocalDateTime createdAt;
    
        @UpdateTimestamp
        @Column(nullable = false)
        private LocalDateTime updatedAt;
    }