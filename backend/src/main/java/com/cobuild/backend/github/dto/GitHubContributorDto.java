package com.cobuild.backend.github.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubContributorDto {
    private String login;
    private String avatarUrl;
    private String htmlUrl;
    private int contributions;
}
