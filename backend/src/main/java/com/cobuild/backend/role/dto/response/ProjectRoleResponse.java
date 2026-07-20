package com.cobuild.backend.role.dto.response;

import java.util.List;
import java.util.UUID;

public class ProjectRoleResponse {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private int openingsCount;
    private int filledCount;
    private boolean isFull;
    private List<String> skills;

    public ProjectRoleResponse() {
    }

    public ProjectRoleResponse(UUID id, UUID projectId, String title, String description,
                               int openingsCount, int filledCount, boolean isFull,
                               List<String> skills) {
        this.id = id;
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.openingsCount = openingsCount;
        this.filledCount = filledCount;
        this.isFull = isFull;
        this.skills = skills;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
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

    public int getFilledCount() {
        return filledCount;
    }

    public void setFilledCount(int filledCount) {
        this.filledCount = filledCount;
    }

    public boolean isFull() {
        return isFull;
    }

    public void setFull(boolean full) {
        isFull = full;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
}