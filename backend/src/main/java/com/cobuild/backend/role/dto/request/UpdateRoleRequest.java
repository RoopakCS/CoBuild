package com.cobuild.backend.role.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public class UpdateRoleRequest {

    /**
     * All fields are optional — only non-null fields are applied by
     * ProjectRoleServiceImpl.updateRole(), so a partial update won't
     * wipe out fields the caller didn't intend to change.
     */

    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    @Min(value = 1, message = "openingsCount must be at least 1")
    private Integer openingsCount;

    /**
     * If provided (non-null), replaces the role's entire skill set.
     * Pass an empty list to clear all skills; pass null to leave
     * skills untouched.
     */
    private List<String> skills;

    public UpdateRoleRequest() {
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

    public Integer getOpeningsCount() {
        return openingsCount;
    }

    public void setOpeningsCount(Integer openingsCount) {
        this.openingsCount = openingsCount;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}