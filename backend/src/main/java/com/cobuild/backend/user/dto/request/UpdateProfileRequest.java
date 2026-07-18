package com.cobuild.backend.user.dto.request;

import com.cobuild.backend.user.ExperienceLevel;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(max = 5000, message = "Bio cannot exceed 5000 characters")
    private String bio;

    private String profileImageUrl;

    private String githubUrl;

    private String linkedinUrl;

    private ExperienceLevel experienceLevel;

}