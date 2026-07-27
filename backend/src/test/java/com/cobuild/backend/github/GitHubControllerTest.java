package com.cobuild.backend.github;

import com.cobuild.backend.github.controller.GitHubController;
import com.cobuild.backend.github.dto.GitHubStatsResponse;
import com.cobuild.backend.github.service.GitHubService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GitHubControllerTest {

    @Mock
    private GitHubService gitHubService;

    private GitHubController gitHubController;

    @BeforeEach
    void setUp() {
        gitHubController = new GitHubController(gitHubService);
    }

    @Test
    @DisplayName("Should return HTTP 200 OK with GitHubStatsResponse payload")
    void shouldReturnGitHubStatsForProject() {
        UUID projectId = UUID.randomUUID();
        GitHubStatsResponse mockResponse = GitHubStatsResponse.builder()
                .isAvailable(true)
                .repositoryUrl("https://github.com/facebook/react")
                .owner("facebook")
                .repoName("react")
                .primaryLanguage("JavaScript")
                .starsCount(220000)
                .forksCount(45000)
                .isActive(true)
                .healthStatus("ACTIVE")
                .build();

        when(gitHubService.getRepoStatsForProject(projectId)).thenReturn(mockResponse);

        ResponseEntity<GitHubStatsResponse> responseEntity = gitHubController.getGitHubStats(projectId);

        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseEntity.getBody()).isNotNull();
        assertThat(responseEntity.getBody().isAvailable()).isTrue();
        assertThat(responseEntity.getBody().getOwner()).isEqualTo("facebook");
        assertThat(responseEntity.getBody().getRepoName()).isEqualTo("react");
        assertThat(responseEntity.getBody().getHealthStatus()).isEqualTo("ACTIVE");
    }
}
