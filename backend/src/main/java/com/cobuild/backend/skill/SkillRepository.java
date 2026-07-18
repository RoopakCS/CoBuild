package com.cobuild.backend.skill;

import com.cobuild.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUser(User user);

    boolean existsByUserAndName(User user, String name);

    void deleteByUser(User user);
}