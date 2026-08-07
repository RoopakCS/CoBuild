package com.cobuild.backend.github.controller;

import com.cobuild.backend.exception.TooManyRequestsException;
import com.cobuild.backend.github.dto.GitHubStatsResponse;
import com.cobuild.backend.github.service.GitHubService;
import com.cobuild.backend.security.RateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubService gitHubService;
    private final RateLimitingService rateLimitingService;

    /**
     * Retrieves GitHub repository statistics and derived health status for a project.
     *
     * @param id Project UUID
     * @return ResponseEntity containing GitHubStatsResponse DTO
     */
    @GetMapping("/{id}/github-stats")
    public ResponseEntity<GitHubStatsResponse> getGitHubStats(@PathVariable UUID id, HttpServletRequest httpRequest) {
        String ip = rateLimitingService.getClientIp(httpRequest);
        if (!rateLimitingService.resolveHighCostBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Rate limit exceeded for GitHub stats. Please try again later.");
        }
        
        GitHubStatsResponse response = gitHubService.getRepoStatsForProject(id);
        return ResponseEntity.ok(response);
    }
}

