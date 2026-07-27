 package com.cobuild.backend.activity.dto.request;
    
    import jakarta.validation.constraints.NotBlank;
    import lombok.Data;
    
    @Data
    public class CreateActivityRequest {
        
        @NotBlank(message = "Activity content cannot be empty")
        private String content;
        
    }