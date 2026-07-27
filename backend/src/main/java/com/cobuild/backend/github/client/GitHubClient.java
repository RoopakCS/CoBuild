package com.cobuild.backend.github.client;

import com.cobuild.backend.github.dto.GitHubContributorDto;
import com.cobuild.backend.github.dto.GitHubRepoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GitHubClient {

    private final RestClient gitHubRestClient;

    /**
     * Fetches repository metadata from GitHub REST API.
     */
    public GitHubRepoResponse fetchRepoMetadata(String owner, String repo) {
        return gitHubRestClient.get()
                .uri("/repos/{owner}/{repo}", owner, repo)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                    if (resp.getStatusCode().value() == 404) {
                        throw new RuntimeException("Repository not found or is private");
                    }
                    if (resp.getStatusCode().value() == 403) {
                        throw new RuntimeException("GitHub API rate limit exceeded");
                    }
                })
                .body(GitHubRepoResponse.class);
    }

    /**
     * Fetches top 5 contributors for a repository.
     */
    public List<GitHubContributorDto> fetchTopContributors(String owner, String repo) {
        try {
            List<Map<String, Object>> contributorsData = gitHubRestClient.get()
                    .uri("/repos/{owner}/{repo}/contributors?per_page=5", owner, repo)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            if (contributorsData == null) {
                return List.of();
            }

            List<GitHubContributorDto> contributors = new ArrayList<>();
            for (Map<String, Object> item : contributorsData) {
                String login = (String) item.get("login");
                String avatarUrl = (String) item.get("avatar_url");
                String htmlUrl = (String) item.get("html_url");
                int contributions = item.get("contributions") instanceof Number n ? n.intValue() : 0;

                contributors.add(GitHubContributorDto.builder()
                        .login(login)
                        .avatarUrl(avatarUrl)
                        .htmlUrl(htmlUrl)
                        .contributions(contributions)
                        .build());
            }
            return contributors;

        } catch (Exception e) {
            log.debug("Could not fetch contributors for {}/{}: {}", owner, repo, e.getMessage());
            return List.of();
        }
    }
}
