package com.cobuild.backend.github.service;

import com.cobuild.backend.github.client.GitHubClient;
import com.cobuild.backend.github.dto.GitHubContributorDto;
import com.cobuild.backend.github.dto.GitHubRepoResponse;
import com.cobuild.backend.github.dto.GitHubStatsResponse;
import com.cobuild.backend.github.parser.GitHubRepoParser;
import com.cobuild.backend.github.parser.RepoCoordinates;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GitHubServiceImpl implements GitHubService {

    private final ProjectRepository projectRepository;
    private final GitHubRepoParser gitHubRepoParser;
    private final GitHubClient gitHubClient;

    @Override
    @Cacheable(value = "githubStats", key = "#projectId")
    public GitHubStatsResponse getRepoStatsForProject(UUID projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String repoUrl = project.getRepositoryUrl();
        if (repoUrl == null || repoUrl.isBlank()) {
            return GitHubStatsResponse.unavailable(repoUrl, "No GitHub repository URL configured for this project");
        }

        RepoCoordinates coords = gitHubRepoParser.parse(repoUrl);
        if (coords == null) {
            return GitHubStatsResponse.unavailable(repoUrl, "Invalid GitHub repository URL format");
        }

        try {
            // 1. Fetch metadata via GitHubClient
            GitHubRepoResponse repoData = gitHubClient.fetchRepoMetadata(coords.owner(), coords.repo());
            if (repoData == null) {
                return GitHubStatsResponse.unavailable(repoUrl, "Failed to fetch repository statistics from GitHub");
            }

            LocalDateTime lastPushedAt = parseIsoTimestamp(repoData.getPushedAt());

            // Derived Business Logic: Repository Health Status
            boolean isActive = lastPushedAt != null && lastPushedAt.isAfter(LocalDateTime.now().minusDays(30));
            String healthStatus = computeHealthStatus(lastPushedAt);

            // 2. Fetch Top 5 Contributors via GitHubClient
            List<GitHubContributorDto> topContributors = gitHubClient.fetchTopContributors(coords.owner(), coords.repo());

            return GitHubStatsResponse.builder()
                    .isAvailable(true)
                    .repositoryUrl(repoUrl)
                    .owner(coords.owner())
                    .repoName(coords.repo())
                    .description(repoData.getDescription())
                    .primaryLanguage(repoData.getLanguage())
                    .starsCount(repoData.getStargazersCount())
                    .forksCount(repoData.getForksCount())
                    .openIssuesCount(repoData.getOpenIssuesCount())
                    .defaultBranch(repoData.getDefaultBranch())
                    .lastPushedAt(lastPushedAt)
                    .isActive(isActive)
                    .healthStatus(healthStatus)
                    .topContributors(topContributors)
                    .build();

        } catch (Exception e) {
            log.warn("GitHub API call failed for project {}: {}", projectId, e.getMessage());
            return GitHubStatsResponse.unavailable(repoUrl, e.getMessage());
        }
    }

    private LocalDateTime parseIsoTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(timestamp), ZoneId.systemDefault());
        } catch (Exception e) {
            return null;
        }
    }

    private String computeHealthStatus(LocalDateTime lastPushedAt) {
        if (lastPushedAt == null) {
            return "INACTIVE";
        }
        LocalDateTime now = LocalDateTime.now();
        if (lastPushedAt.isAfter(now.minusDays(30))) {
            return "ACTIVE";
        } else if (lastPushedAt.isAfter(now.minusDays(90))) {
            return "STALE";
        } else {
            return "INACTIVE";
        }
    }
}
