package com.cobuild.backend.skill.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(max = 50, message = "Skill name cannot exceed 50 characters")
    private String name;
}