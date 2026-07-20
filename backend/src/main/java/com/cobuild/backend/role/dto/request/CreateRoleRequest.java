package com.cobuild.backend.role.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateRoleRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    @Min(value = 1, message = "openingsCount must be at least 1")
    private int openingsCount;

    /**
     * Skill names to attach to this role (e.g. "React", "Node").
     * Optional — may be null or empty if no skills are specified yet.
     */
    private List<String> skills;

    public CreateRoleRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getOpeningsCount() {
        return openingsCount;
    }

    public void setOpeningsCount(int openingsCount) {
        this.openingsCount = openingsCount;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}