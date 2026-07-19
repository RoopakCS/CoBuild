package com.cobuild.backend.skill;

import com.cobuild.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUser(User user);

    boolean existsByUserAndName(User user, String name);

    void deleteByUser(User user);
}