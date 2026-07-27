package com.cobuild.backend.github;

import com.cobuild.backend.github.parser.GitHubRepoParser;
import com.cobuild.backend.github.parser.RepoCoordinates;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class GitHubRepoParserTest {

    private GitHubRepoParser parser;

    @BeforeEach
    void setUp() {
        parser = new GitHubRepoParser();
    }

    @Test
    @DisplayName("Should extract owner and repo from standard HTTPS GitHub URL")
    void shouldExtractOwnerAndRepoFromStandardUrl() {
        RepoCoordinates result = parser.parse("https://github.com/facebook/react");
        assertThat(result).isNotNull();
        assertThat(result.owner()).isEqualTo("facebook");
        assertThat(result.repo()).isEqualTo("react");
    }

    @Test
    @DisplayName("Should extract owner and repo from URL ending with .git")
    void shouldExtractOwnerAndRepoFromGitUrl() {
        RepoCoordinates result = parser.parse("https://github.com/spring-projects/spring-boot.git");
        assertThat(result).isNotNull();
        assertThat(result.owner()).isEqualTo("spring-projects");
        assertThat(result.repo()).isEqualTo("spring-boot");
    }

    @Test
    @DisplayName("Should extract owner and repo from SSH format")
    void shouldExtractOwnerAndRepoFromSshUrl() {
        RepoCoordinates result = parser.parse("git@github.com:torvalds/linux.git");
        assertThat(result).isNotNull();
        assertThat(result.owner()).isEqualTo("torvalds");
        assertThat(result.repo()).isEqualTo("linux");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "https://gitlab.com/owner/repo",
            "https://google.com",
            "not-a-url"
    })
    @DisplayName("Should return null for invalid or non-GitHub URLs")
    void shouldReturnNullForInvalidUrls(String invalidUrl) {
        RepoCoordinates result = parser.parse(invalidUrl);
        assertThat(result).isNull();
    }
}
