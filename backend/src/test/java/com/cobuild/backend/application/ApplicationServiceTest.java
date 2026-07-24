package com.cobuild.backend.application;

import com.cobuild.backend.application.dto.request.CreateApplicationRequest;
import com.cobuild.backend.application.dto.response.ApplicationResponse;
import com.cobuild.backend.exception.BadRequestException;
import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.membership.Membership;
import com.cobuild.backend.membership.MembershipRepository;
import com.cobuild.backend.membership.MembershipRole;
import com.cobuild.backend.membership.MembershipStatus;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.project.ProjectStatus;
import com.cobuild.backend.role.ProjectRole;
import com.cobuild.backend.role.ProjectRoleRepository;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectRoleRepository projectRoleRepository;
    @Mock private MembershipRepository membershipRepository;

    @InjectMocks
    private ApplicationService service;

    private User owner;
    private User applicant;
    private Project project;
    private ProjectRole role;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(UUID.randomUUID()).name("Owner").email("owner@test.com").build();
        applicant = User.builder().id(UUID.randomUUID()).name("Applicant").email("applicant@test.com").build();

        project = Project.builder()
                .id(UUID.randomUUID())
                .owner(owner)
                .title("Test Project")
                .status(ProjectStatus.OPEN)
                .build();

        role = new ProjectRole();
        role.setId(UUID.randomUUID());
        role.setProject(project);
        role.setTitle("Backend Dev");
        role.setOpeningsCount(2);
        role.setFilledCount(0);
        role.setSkills(Collections.emptyList());
    }

    // ============================================================
    // APPLY
    // ============================================================

    @Nested
    @DisplayName("apply")
    class Apply {

        @Test
        @DisplayName("succeeds for valid application")
        void apply_success() {
            CreateApplicationRequest request = new CreateApplicationRequest("I'm great!", role.getId());

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));
            when(userRepository.findByEmail(applicant.getEmail())).thenReturn(Optional.of(applicant));
            when(applicationRepository.existsByProjectIdAndApplicantIdAndStatusIn(any(), any(), any())).thenReturn(false);
            when(membershipRepository.findByProjectIdAndUserId(any(), any())).thenReturn(Optional.empty());
            when(applicationRepository.save(any(ProjectApplication.class))).thenAnswer(inv -> {
                ProjectApplication app = inv.getArgument(0);
                app.setId(UUID.randomUUID());
                app.setCreatedAt(LocalDateTime.now());
                app.setUpdatedAt(LocalDateTime.now());
                return app;
            });

            ApplicationResponse response = service.apply(project.getId(), applicant.getEmail(), request);

            assertThat(response).isNotNull();
            assertThat(response.roleId()).isEqualTo(role.getId());
            assertThat(response.roleTitle()).isEqualTo("Backend Dev");
        }

        @Test
        @DisplayName("rejects when role is full")
        void apply_roleFullThrows() {
            role.setFilledCount(2); // matches openingsCount

            CreateApplicationRequest request = new CreateApplicationRequest("Please!", role.getId());

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.apply(project.getId(), applicant.getEmail(), request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("full");
        }

        @Test
        @DisplayName("rejects when project is not OPEN")
        void apply_projectClosedThrows() {
            project.setStatus(ProjectStatus.CLOSED);

            CreateApplicationRequest request = new CreateApplicationRequest("Please!", role.getId());

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

            assertThatThrownBy(() -> service.apply(project.getId(), applicant.getEmail(), request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("not accepting");
        }

        @Test
        @DisplayName("rejects when owner applies to own project")
        void apply_ownerCannotApply() {
            CreateApplicationRequest request = new CreateApplicationRequest("Me!", role.getId());

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));

            assertThatThrownBy(() -> service.apply(project.getId(), owner.getEmail(), request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("own project");
        }

        @Test
        @DisplayName("rejects duplicate pending application")
        void apply_duplicateThrows() {
            CreateApplicationRequest request = new CreateApplicationRequest("Again!", role.getId());

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));
            when(userRepository.findByEmail(applicant.getEmail())).thenReturn(Optional.of(applicant));
            when(applicationRepository.existsByProjectIdAndApplicantIdAndStatusIn(
                    project.getId(), applicant.getId(), List.of(ApplicationStatus.PENDING)))
                    .thenReturn(true);

            assertThatThrownBy(() -> service.apply(project.getId(), applicant.getEmail(), request))
                    .isInstanceOf(DuplicateResourceException.class);
        }
    }

    // ============================================================
    // ACCEPT
    // ============================================================

    @Nested
    @DisplayName("updateStatus — ACCEPT")
    class AcceptApplication {

        private ProjectApplication pendingApp;

        @BeforeEach
        void setUp() {
            pendingApp = ProjectApplication.builder()
                    .id(UUID.randomUUID())
                    .project(project)
                    .role(role)
                    .applicant(applicant)
                    .message("Pick me!")
                    .status(ApplicationStatus.PENDING)
                    .build();
            pendingApp.setCreatedAt(LocalDateTime.now());
            pendingApp.setUpdatedAt(LocalDateTime.now());
        }

        @Test
        @DisplayName("accept creates membership and increments filledCount")
        void accept_success() {
            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
            when(projectRoleRepository.findByIdForUpdate(role.getId())).thenReturn(Optional.of(role));
            when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
            when(applicationRepository.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));
            when(projectRoleRepository.save(any(ProjectRole.class))).thenAnswer(inv -> inv.getArgument(0));

            ApplicationResponse response = service.updateStatus(pendingApp.getId(), ApplicationStatus.ACCEPTED, owner.getEmail());

            assertThat(response.status()).isEqualTo(ApplicationStatus.ACCEPTED);
            assertThat(role.getFilledCount()).isEqualTo(1);
            verify(membershipRepository).save(any(Membership.class));
        }

        @Test
        @DisplayName("accept auto-rejects remaining PENDING when role becomes full")
        void accept_autoRejectsWhenFull() {
            role.setOpeningsCount(1);
            role.setFilledCount(0);

            ProjectApplication otherPendingApp = ProjectApplication.builder()
                    .id(UUID.randomUUID())
                    .project(project)
                    .role(role)
                    .applicant(User.builder().id(UUID.randomUUID()).name("Other").email("other@test.com").build())
                    .message("Me too!")
                    .status(ApplicationStatus.PENDING)
                    .build();

            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
            when(projectRoleRepository.findByIdForUpdate(role.getId())).thenReturn(Optional.of(role));
            when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
            when(applicationRepository.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));
            when(projectRoleRepository.save(any(ProjectRole.class))).thenAnswer(inv -> inv.getArgument(0));
            when(applicationRepository.findByRoleIdAndStatus(role.getId(), ApplicationStatus.PENDING))
                    .thenReturn(List.of(otherPendingApp));
            when(applicationRepository.saveAll(any())).thenReturn(List.of(otherPendingApp));

            service.updateStatus(pendingApp.getId(), ApplicationStatus.ACCEPTED, owner.getEmail());

            // filledCount should be 1 (== openingsCount), triggering auto-reject
            assertThat(role.getFilledCount()).isEqualTo(1);
            assertThat(otherPendingApp.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        }

        @Test
        @DisplayName("accept throws when role is already full (concurrency guard)")
        void accept_fullRoleThrows() {
            role.setFilledCount(2); // matches openingsCount

            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
            when(projectRoleRepository.findByIdForUpdate(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.updateStatus(pendingApp.getId(), ApplicationStatus.ACCEPTED, owner.getEmail()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("full");
        }

        @Test
        @DisplayName("non-owner cannot accept")
        void accept_nonOwnerForbidden() {
            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(applicant.getEmail())).thenReturn(Optional.of(applicant));

            assertThatThrownBy(() -> service.updateStatus(pendingApp.getId(), ApplicationStatus.ACCEPTED, applicant.getEmail()))
                    .isInstanceOf(ForbiddenException.class);
        }

        @Test
        @DisplayName("accept auto-rejects pending applications for filled role only, not other roles on project")
        void accept_autoRejectsOnlyForSpecificRole() {
            role.setOpeningsCount(1);
            role.setFilledCount(0);

            ProjectRole otherRole = new ProjectRole();
            otherRole.setId(UUID.randomUUID());
            otherRole.setProject(project);
            otherRole.setTitle("Frontend Dev");
            otherRole.setOpeningsCount(2);

            ProjectApplication otherRoleApp = ProjectApplication.builder()
                    .id(UUID.randomUUID())
                    .project(project)
                    .role(otherRole)
                    .applicant(User.builder().id(UUID.randomUUID()).name("Frontend Applicant").email("fe@test.com").build())
                    .message("Frontend Dev pitch")
                    .status(ApplicationStatus.PENDING)
                    .build();

            ProjectApplication roleSameApp = ProjectApplication.builder()
                    .id(UUID.randomUUID())
                    .project(project)
                    .role(role)
                    .applicant(User.builder().id(UUID.randomUUID()).name("Backend Applicant").email("be@test.com").build())
                    .message("Backend Dev pitch")
                    .status(ApplicationStatus.PENDING)
                    .build();

            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
            when(projectRoleRepository.findByIdForUpdate(role.getId())).thenReturn(Optional.of(role));
            when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
            when(applicationRepository.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));
            when(projectRoleRepository.save(any(ProjectRole.class))).thenAnswer(inv -> inv.getArgument(0));
            when(applicationRepository.findByRoleIdAndStatus(role.getId(), ApplicationStatus.PENDING))
                    .thenReturn(List.of(roleSameApp));
            when(applicationRepository.saveAll(any())).thenReturn(List.of(roleSameApp));

            service.updateStatus(pendingApp.getId(), ApplicationStatus.ACCEPTED, owner.getEmail());

            assertThat(roleSameApp.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
            assertThat(otherRoleApp.getStatus()).isEqualTo(ApplicationStatus.PENDING); // untouched
        }
    }

    // ============================================================
    // REJECT (direct)
    // ============================================================

    @Nested
    @DisplayName("updateStatus — REJECT")
    class RejectApplication {

        @Test
        @DisplayName("reject does NOT affect filledCount")
        void reject_doesNotAffectCount() {
            ProjectApplication pendingApp = ProjectApplication.builder()
                    .id(UUID.randomUUID())
                    .project(project)
                    .role(role)
                    .applicant(applicant)
                    .message("Nah")
                    .status(ApplicationStatus.PENDING)
                    .build();
            pendingApp.setCreatedAt(LocalDateTime.now());
            pendingApp.setUpdatedAt(LocalDateTime.now());

            when(applicationRepository.findById(pendingApp.getId())).thenReturn(Optional.of(pendingApp));
            when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
            when(applicationRepository.save(any(ProjectApplication.class))).thenAnswer(inv -> inv.getArgument(0));

            service.updateStatus(pendingApp.getId(), ApplicationStatus.REJECTED, owner.getEmail());

            assertThat(role.getFilledCount()).isEqualTo(0); // unchanged
            verify(projectRoleRepository, never()).save(any());
        }
    }
}
