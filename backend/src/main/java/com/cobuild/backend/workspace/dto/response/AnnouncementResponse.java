package com.cobuild.backend.workspace.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AnnouncementResponse {

    private UUID id;

    private UUID authorId;

    private String authorName;

    private String authorPhotoUrl;

    private String title;

    private String content;

    private boolean isPinned;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
