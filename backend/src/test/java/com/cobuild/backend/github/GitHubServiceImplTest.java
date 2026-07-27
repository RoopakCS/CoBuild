package com.cobuild.backend.github;

import com.cobuild.backend.github.client.GitHubClient;
import com.cobuild.backend.github.dto.GitHubStatsResponse;
import com.cobuild.backend.github.parser.GitHubRepoParser;
import com.cobuild.backend.github.service.GitHubServiceImpl;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GitHubServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private GitHubClient gitHubClient;

    private GitHubRepoParser gitHubRepoParser;
    private GitHubServiceImpl gitHubService;

    @BeforeEach
    void setUp() {
        gitHubRepoParser = new GitHubRepoParser();
        gitHubService = new GitHubServiceImpl(projectRepository, gitHubRepoParser, gitHubClient);
    }

    @Test
    @DisplayName("Should return unavailable response when project has no repository URL")
    void shouldReturnUnavailableWhenNoRepoUrl() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder()
                .id(projectId)
                .repositoryUrl(null)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        GitHubStatsResponse response = gitHubService.getRepoStatsForProject(projectId);

        assertThat(response.isAvailable()).isFalse();
        assertThat(response.getErrorMessage()).contains("No GitHub repository URL configured");
    }

    @Test
    @DisplayName("Should return unavailable response when repository URL format is invalid")
    void shouldReturnUnavailableWhenInvalidUrlFormat() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder()
                .id(projectId)
                .repositoryUrl("https://invalid-website.com/invalid")
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        GitHubStatsResponse response = gitHubService.getRepoStatsForProject(projectId);

        assertThat(response.isAvailable()).isFalse();
        assertThat(response.getErrorMessage()).contains("Invalid GitHub repository URL format");
    }
}
