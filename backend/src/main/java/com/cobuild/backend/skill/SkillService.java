package com.cobuild.backend.skill;

import com.cobuild.backend.skill.dto.request.CreateSkillRequest;
import com.cobuild.backend.skill.dto.response.SkillResponse;

import java.util.List;

public interface SkillService {

    SkillResponse addSkill(CreateSkillRequest request);

    List<SkillResponse> getMySkills();

    SkillResponse updateSkill(Long skillId, CreateSkillRequest request);

    void deleteSkill(Long skillId);
}