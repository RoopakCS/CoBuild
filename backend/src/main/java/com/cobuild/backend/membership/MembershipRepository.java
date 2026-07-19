package com.cobuild.backend.membership;

import com.cobuild.backend.project.Project;
import com.cobuild.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository
        extends JpaRepository<Membership, UUID> {

    List<Membership> findByProject(Project project);

    List<Membership> findByUser(User user);

    Optional<Membership> findByUserAndProject(User user,
                                              Project project);

    boolean existsByUserAndProject(User user,
                                   Project project);

}