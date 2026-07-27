package com.cobuild.backend.github.parser;

import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GitHubRepoParser {

    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "^(?:https?://(?:www\\.)?github\\.com/|git@github\\.com:)([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+?)(?:\\.git)?(?:/.*)?$"
    );

    /**
     * Parses a GitHub URL and extracts owner and repository name.
     * Returns null if the URL is invalid or not a GitHub URL.
     */
    public RepoCoordinates parse(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }

        Matcher matcher = GITHUB_URL_PATTERN.matcher(url.trim());
        if (matcher.matches()) {
            String owner = matcher.group(1);
            String repo = matcher.group(2);
            return new RepoCoordinates(owner, repo);
        }

        return null;
    }
}
