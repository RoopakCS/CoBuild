package com.cobuild.backend.workspace;

import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.membership.Membership;
import com.cobuild.backend.membership.MembershipRepository;
import com.cobuild.backend.membership.MembershipRole;
import com.cobuild.backend.membership.MembershipStatus;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import com.cobuild.backend.workspace.dto.request.CreateAnnouncementRequest;
import com.cobuild.backend.workspace.dto.request.CreateWorkspaceLinkRequest;
import com.cobuild.backend.workspace.dto.response.AnnouncementResponse;
import com.cobuild.backend.workspace.dto.response.TeamDirectoryMemberResponse;
import com.cobuild.backend.workspace.dto.response.WorkspaceLinkResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class WorkspaceService {

    private final ProjectRepository projectRepository;
    private final MembershipRepository membershipRepository;
    private final ProjectAnnouncementRepository announcementRepository;
    private final ProjectWorkspaceLinkRepository linkRepository;

    // ═══════════════════════════════════════════
    // Access Guard
    // ═══════════════════════════════════════════

    /**
     * Verifies the user is either the project owner or an ACTIVE member.
     * Throws ForbiddenException if neither condition is met.
     */
    private void assertActiveMemberOrOwner(Project project, User user) {

        // Check if user is the project owner
        if (project.getOwner().getId().equals(user.getId())) {
            return;
        }

        // Check if user is an active member
        membershipRepository.findByProjectIdAndUserId(project.getId(), user.getId())
                .filter(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .orElseThrow(() -> {
                    log.warn("User {} attempted to access workspace of project {} without authorization",
                            user.getEmail(), project.getId());
                    return new ForbiddenException(
                            "You must be an active team member to access this workspace");
                });
    }

    // ═══════════════════════════════════════════
    // Announcements
    // ═══════════════════════════════════════════

    public List<AnnouncementResponse> getAnnouncements(UUID projectId) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        return announcementRepository
                .findByProjectIdOrderByIsPinnedDescCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToAnnouncementResponse)
                .toList();
    }

    @Transactional
    public AnnouncementResponse createAnnouncement(UUID projectId,
                                                    CreateAnnouncementRequest request) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        ProjectAnnouncement announcement = ProjectAnnouncement.builder()
                .project(project)
                .author(currentUser)
                .title(request.getTitle())
                .content(request.getContent())
                .isPinned(request.isPinned())
                .build();

        ProjectAnnouncement saved = announcementRepository.save(announcement);

        log.info("User {} created announcement '{}' in project {}",
                currentUser.getEmail(), saved.getTitle(), projectId);

        return mapToAnnouncementResponse(saved);
    }

    @Transactional
    public void deleteAnnouncement(UUID projectId, UUID announcementId) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        ProjectAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        // Verify announcement belongs to this project
        if (!announcement.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Announcement not found in this project");
        }

        // Only the author or the project owner can delete
        boolean isAuthor = announcement.getAuthor().getId().equals(currentUser.getId());
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        if (!isAuthor && !isOwner) {
            throw new ForbiddenException(
                    "Only the announcement author or project owner can delete this announcement");
        }

        announcementRepository.delete(announcement);

        log.info("User {} deleted announcement {} from project {}",
                currentUser.getEmail(), announcementId, projectId);
    }

    // ═══════════════════════════════════════════
    // Workspace Links
    // ═══════════════════════════════════════════

    public List<WorkspaceLinkResponse> getWorkspaceLinks(UUID projectId) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        return linkRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToLinkResponse)
                .toList();
    }

    @Transactional
    public WorkspaceLinkResponse createWorkspaceLink(UUID projectId,
                                                      CreateWorkspaceLinkRequest request) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        ProjectWorkspaceLink link = ProjectWorkspaceLink.builder()
                .project(project)
                .addedBy(currentUser)
                .title(request.getTitle())
                .url(request.getUrl())
                .category(request.getCategory())
                .build();

        ProjectWorkspaceLink saved = linkRepository.save(link);

        log.info("User {} added workspace link '{}' ({}) to project {}",
                currentUser.getEmail(), saved.getTitle(), saved.getCategory(), projectId);

        return mapToLinkResponse(saved);
    }

    @Transactional
    public void deleteWorkspaceLink(UUID projectId, UUID linkId) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        ProjectWorkspaceLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace link not found"));

        // Verify link belongs to this project
        if (!link.getProject().getId().equals(projectId)) {
            throw new ResourceNotFoundException("Workspace link not found in this project");
        }

        // Only the link creator or the project owner can delete
        boolean isCreator = link.getAddedBy().getId().equals(currentUser.getId());
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());

        if (!isCreator && !isOwner) {
            throw new ForbiddenException(
                    "Only the link creator or project owner can delete this link");
        }

        linkRepository.delete(link);

        log.info("User {} deleted workspace link {} from project {}",
                currentUser.getEmail(), linkId, projectId);
    }

    // ═══════════════════════════════════════════
    // Team Directory
    // ═══════════════════════════════════════════

    public List<TeamDirectoryMemberResponse> getTeamDirectory(UUID projectId) {

        Project project = findProjectOrThrow(projectId);
        User currentUser = getCurrentUser();
        assertActiveMemberOrOwner(project, currentUser);

        List<Membership> activeMembers = membershipRepository.findByProjectAndStatusIn(
                project, List.of(MembershipStatus.ACTIVE));

        List<TeamDirectoryMemberResponse> directory = activeMembers.stream()
                .map(this::mapToTeamDirectoryResponse)
                .toList();

        // Include the owner if they don't have a membership row
        boolean ownerInList = directory.stream()
                .anyMatch(m -> m.getUserId().equals(project.getOwner().getId()));

        if (!ownerInList) {
            User owner = project.getOwner();
            TeamDirectoryMemberResponse ownerEntry = TeamDirectoryMemberResponse.builder()
                    .userId(owner.getId())
                    .userName(owner.getName())
                    .email(owner.getEmail())
                    .profilePhotoUrl(owner.getProfilePhotoUrl())
                    .githubUrl(owner.getGithubUrl())
                    .linkedinUrl(owner.getLinkedinUrl())
                    .membershipRole(MembershipRole.OWNER)
                    .projectRoleTitle("Owner")
                    .joinedAt(project.getCreatedAt())
                    .build();

            // Prepend owner at the top
            directory = new java.util.ArrayList<>(directory);
            directory.add(0, ownerEntry);
        }

        return directory;
    }

    // ═══════════════════════════════════════════
    // Helper Methods
    // ═══════════════════════════════════════════

    private Project findProjectOrThrow(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Unauthorized");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Unauthorized");
        }

        User user = userPrincipal.getUser();

        if (user == null) {
            throw new ForbiddenException("Unauthorized");
        }

        return user;
    }

    private AnnouncementResponse mapToAnnouncementResponse(ProjectAnnouncement announcement) {

        User author = announcement.getAuthor();

        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .authorId(author != null ? author.getId() : null)
                .authorName(author != null ? author.getName() : null)
                .authorPhotoUrl(author != null ? author.getProfilePhotoUrl() : null)
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .isPinned(announcement.isPinned())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .build();
    }

    private WorkspaceLinkResponse mapToLinkResponse(ProjectWorkspaceLink link) {

        User addedBy = link.getAddedBy();

        return WorkspaceLinkResponse.builder()
                .id(link.getId())
                .title(link.getTitle())
                .url(link.getUrl())
                .category(link.getCategory())
                .addedByName(addedBy != null ? addedBy.getName() : null)
                .createdAt(link.getCreatedAt())
                .build();
    }

    private TeamDirectoryMemberResponse mapToTeamDirectoryResponse(Membership membership) {

        User user = membership.getUser();

        return TeamDirectoryMemberResponse.builder()
                .userId(user.getId())
                .userName(user.getName())
                .email(user.getEmail())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .membershipRole(membership.getMembershipRole())
                .projectRoleTitle(membership.getProjectRole() != null
                        ? membership.getProjectRole().getTitle()
                        : null)
                .joinedAt(membership.getJoinedAt())
                .build();
    }

}
