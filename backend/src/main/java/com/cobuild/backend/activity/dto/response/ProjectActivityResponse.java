package com.cobuild.backend.activity.dto.response;
    
    import lombok.Builder;
    import lombok.Data;
    
    import java.time.LocalDateTime;
    import java.util.UUID;
    
    @Data
    @Builder
    public class ProjectActivityResponse {
        
        private UUID id;
        private UUID projectId;
        
        private UUID authorId;
        private String authorName;
        private String authorProfileImageUrl;
        
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
    }