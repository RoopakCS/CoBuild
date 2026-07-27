package com.cobuild.backend.github.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubStatsResponse {

    private boolean isAvailable;
    private String repositoryUrl;
    private String owner;
    private String repoName;
    private String description;
    private String primaryLanguage;
    private int starsCount;
    private int forksCount;
    private int openIssuesCount;
    private String defaultBranch;
    private LocalDateTime lastPushedAt;
    private boolean isActive;
    private String healthStatus; // ACTIVE, STALE, INACTIVE
    private List<GitHubContributorDto> topContributors;
    private String errorMessage;

    /**
     * Helper to create a fallback response when GitHub API fails,
     * repository is private/missing, or rate limit is reached.
     */
    public static GitHubStatsResponse unavailable(String repositoryUrl, String errorMessage) {
        return GitHubStatsResponse.builder()
                .isAvailable(false)
                .repositoryUrl(repositoryUrl)
                .errorMessage(errorMessage)
                .build();
    }
}
