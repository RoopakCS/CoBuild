package com.cobuild.backend.workspace;

import com.cobuild.backend.workspace.dto.request.CreateAnnouncementRequest;
import com.cobuild.backend.workspace.dto.request.CreateWorkspaceLinkRequest;
import com.cobuild.backend.workspace.dto.response.AnnouncementResponse;
import com.cobuild.backend.workspace.dto.response.TeamDirectoryMemberResponse;
import com.cobuild.backend.workspace.dto.response.WorkspaceLinkResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    // ═══════════════════════════════════════════
    // Announcements
    // ═══════════════════════════════════════════

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @PathVariable UUID projectId) {

        return ResponseEntity.ok(
                workspaceService.getAnnouncements(projectId));
    }

    @PostMapping("/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateAnnouncementRequest request) {

        AnnouncementResponse response = workspaceService
                .createAnnouncement(projectId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable UUID projectId,
            @PathVariable UUID announcementId) {

        workspaceService.deleteAnnouncement(projectId, announcementId);

        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════
    // Workspace Links
    // ═══════════════════════════════════════════

    @GetMapping("/links")
    public ResponseEntity<List<WorkspaceLinkResponse>> getWorkspaceLinks(
            @PathVariable UUID projectId) {

        return ResponseEntity.ok(
                workspaceService.getWorkspaceLinks(projectId));
    }

    @PostMapping("/links")
    public ResponseEntity<WorkspaceLinkResponse> createWorkspaceLink(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateWorkspaceLinkRequest request) {

        WorkspaceLinkResponse response = workspaceService
                .createWorkspaceLink(projectId, request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/links/{linkId}")
    public ResponseEntity<Void> deleteWorkspaceLink(
            @PathVariable UUID projectId,
            @PathVariable UUID linkId) {

        workspaceService.deleteWorkspaceLink(projectId, linkId);

        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════
    // Team Directory
    // ═══════════════════════════════════════════

    @GetMapping("/team")
    public ResponseEntity<List<TeamDirectoryMemberResponse>> getTeamDirectory(
            @PathVariable UUID projectId) {

        return ResponseEntity.ok(
                workspaceService.getTeamDirectory(projectId));
    }

}
