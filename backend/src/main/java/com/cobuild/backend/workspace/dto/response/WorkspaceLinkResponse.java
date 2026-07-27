package com.cobuild.backend.workspace.dto.response;

import com.cobuild.backend.workspace.LinkCategory;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class WorkspaceLinkResponse {

    private UUID id;

    private String title;

    private String url;

    private LinkCategory category;

    private String addedByName;

    private LocalDateTime createdAt;

}
