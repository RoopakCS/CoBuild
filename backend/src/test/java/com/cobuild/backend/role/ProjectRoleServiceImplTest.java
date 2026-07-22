package com.cobuild.backend.role;

import com.cobuild.backend.application.ApplicationStatus;
import com.cobuild.backend.application.ProjectApplication;
import com.cobuild.backend.exception.BadRequestException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.role.dto.request.CreateRoleRequest;
import com.cobuild.backend.role.dto.request.UpdateRoleRequest;
import com.cobuild.backend.role.dto.response.ProjectRoleResponse;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectRoleServiceImplTest {

    @Mock private ProjectRoleRepository projectRoleRepository;
    @Mock private RoleSkillRepository roleSkillRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectRoleServiceImpl service;

    private User owner;
    private User otherUser;
    private Project project;
    private ProjectRole role;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(UUID.randomUUID()).name("Owner").email("owner@test.com").build();
        otherUser = User.builder().id(UUID.randomUUID()).name("Other").email("other@test.com").build();

        project = Project.builder().id(UUID.randomUUID()).owner(owner).title("Test Project").build();

        role = new ProjectRole();
        role.setId(UUID.randomUUID());
        role.setProject(project);
        role.setTitle("Backend Dev");
        role.setDescription("Build APIs");
        role.setOpeningsCount(2);
        role.setFilledCount(0);
        role.setSkills(Collections.emptyList());
        role.setApplications(Collections.emptyList());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ============================================================
    // CREATE
    // ============================================================

    @Nested
    @DisplayName("createRole")
    class CreateRole {

        @Test
        @DisplayName("succeeds when called by the project owner")
        void createRole_ownerCreatesSuccessfully() {
            authenticateAs(owner);

            CreateRoleRequest request = new CreateRoleRequest();
            request.setTitle("Frontend Dev");
            request.setOpeningsCount(3);

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
            when(projectRoleRepository.save(any(ProjectRole.class))).thenAnswer(inv -> {
                ProjectRole r = inv.getArgument(0);
                r.setId(UUID.randomUUID());
                r.setSkills(Collections.emptyList());
                return r;
            });

            ProjectRoleResponse response = service.createRole(project.getId(), request);

            assertThat(response.getTitle()).isEqualTo("Frontend Dev");
            assertThat(response.getOpeningsCount()).isEqualTo(3);
            assertThat(response.getFilledCount()).isEqualTo(0);
            assertThat(response.isFull()).isFalse();

            verify(projectRoleRepository).save(any(ProjectRole.class));
        }

        @Test
        @DisplayName("throws ForbiddenException when caller is not the owner")
        void createRole_nonOwnerThrowsForbidden() {
            authenticateAs(otherUser);

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

            CreateRoleRequest request = new CreateRoleRequest();
            request.setTitle("Frontend Dev");
            request.setOpeningsCount(1);

            assertThatThrownBy(() -> service.createRole(project.getId(), request))
                    .isInstanceOf(ForbiddenException.class);
        }

        @Test
        @DisplayName("throws when openingsCount < 1")
        void createRole_invalidOpeningsCount() {
            authenticateAs(owner);

            when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

            CreateRoleRequest request = new CreateRoleRequest();
            request.setTitle("Tester");
            request.setOpeningsCount(0);

            assertThatThrownBy(() -> service.createRole(project.getId(), request))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // ============================================================
    // DELETE
    // ============================================================

    @Nested
    @DisplayName("deleteRole")
    class DeleteRole {

        @Test
        @DisplayName("succeeds when role has no members and no pending apps")
        void deleteRole_success() {
            authenticateAs(owner);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatCode(() -> service.deleteRole(project.getId(), role.getId()))
                    .doesNotThrowAnyException();

            verify(projectRoleRepository).delete(role);
        }

        @Test
        @DisplayName("blocked when role has active members (filledCount > 0)")
        void deleteRole_blockedWithActiveMembers() {
            authenticateAs(owner);

            role.setFilledCount(1);
            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.deleteRole(project.getId(), role.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("active members");
        }

        @Test
        @DisplayName("blocked when role has pending applications")
        void deleteRole_blockedWithPendingApplications() {
            authenticateAs(owner);

            ProjectApplication pendingApp = new ProjectApplication();
            pendingApp.setStatus(ApplicationStatus.PENDING);
            role.setApplications(List.of(pendingApp));

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.deleteRole(project.getId(), role.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("pending applications");
        }

        @Test
        @DisplayName("throws ForbiddenException when caller is not the owner")
        void deleteRole_nonOwnerForbidden() {
            authenticateAs(otherUser);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.deleteRole(project.getId(), role.getId()))
                    .isInstanceOf(ForbiddenException.class);
        }
    }

    // ============================================================
    // INCREMENT / DECREMENT
    // ============================================================

    @Nested
    @DisplayName("incrementFilledCount")
    class IncrementFilledCount {

        @Test
        @DisplayName("increments and returns false when role is not yet full")
        void increment_notFull() {
            role.setFilledCount(0);
            role.setOpeningsCount(2);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            boolean isFull = service.incrementFilledCount(role.getId());

            assertThat(isFull).isFalse();
            assertThat(role.getFilledCount()).isEqualTo(1);
            verify(projectRoleRepository).save(role);
        }

        @Test
        @DisplayName("increments and returns true when role becomes full")
        void increment_becomesFull() {
            role.setFilledCount(1);
            role.setOpeningsCount(2);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            boolean isFull = service.incrementFilledCount(role.getId());

            assertThat(isFull).isTrue();
            assertThat(role.getFilledCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("throws BadRequestException when role is already full")
        void increment_alreadyFull() {
            role.setFilledCount(2);
            role.setOpeningsCount(2);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            assertThatThrownBy(() -> service.incrementFilledCount(role.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("full");
        }
    }

    @Nested
    @DisplayName("decrementFilledCount")
    class DecrementFilledCount {

        @Test
        @DisplayName("decrements when filledCount > 0")
        void decrement_positive() {
            role.setFilledCount(2);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            service.decrementFilledCount(role.getId());

            assertThat(role.getFilledCount()).isEqualTo(1);
            verify(projectRoleRepository).save(role);
        }

        @Test
        @DisplayName("does nothing when filledCount is already 0")
        void decrement_zero() {
            role.setFilledCount(0);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            service.decrementFilledCount(role.getId());

            assertThat(role.getFilledCount()).isEqualTo(0);
            verify(projectRoleRepository, never()).save(any());
        }
    }

    // ============================================================
    // UPDATE
    // ============================================================

    @Nested
    @DisplayName("updateRole")
    class UpdateRole {

        @Test
        @DisplayName("cannot reduce openingsCount below filledCount")
        void updateRole_cannotReduceBelowFilled() {
            authenticateAs(owner);

            role.setFilledCount(2);
            role.setOpeningsCount(3);

            when(projectRoleRepository.findById(role.getId())).thenReturn(Optional.of(role));

            UpdateRoleRequest request = new UpdateRoleRequest();
            request.setOpeningsCount(1);  // below filledCount of 2

            assertThatThrownBy(() -> service.updateRole(project.getId(), role.getId(), request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("filledCount");
        }
    }
}
