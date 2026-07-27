package com.cobuild.backend.github.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubCommitDto {
    private String sha;
    private String message;
    private String authorName;
    private String authorAvatarUrl;
    private LocalDateTime committedAt;
}
