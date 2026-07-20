package com.cobuild.backend.role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RoleSkillRepository extends JpaRepository<RoleSkill, UUID> {
    // No custom query methods yet — added in Phase 2 alongside the service layer
    // that actually needs them (e.g. findByRoleId(UUID roleId)).
}