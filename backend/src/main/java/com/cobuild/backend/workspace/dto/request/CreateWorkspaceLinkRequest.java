package com.cobuild.backend.workspace.dto.request;

import com.cobuild.backend.workspace.LinkCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWorkspaceLinkRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @NotBlank(message = "URL is required")
    @Size(max = 2000, message = "URL must be at most 2000 characters")
    private String url;

    @NotNull(message = "Category is required")
    private LinkCategory category;

}
