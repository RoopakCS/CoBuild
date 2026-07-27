package com.cobuild.backend.github.service;

import com.cobuild.backend.github.dto.GitHubStatsResponse;

import java.util.UUID;

public interface GitHubService {

    /**
     * Retrieves cached or live GitHub repository statistics and health status for a project.
     *
     * @param projectId UUID of the project
     * @return GitHubStatsResponse containing repository metrics or graceful fallback details
     */
    GitHubStatsResponse getRepoStatsForProject(UUID projectId);
}
