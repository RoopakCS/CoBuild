package com.cobuild.backend.skill;

import com.cobuild.backend.skill.dto.request.CreateSkillRequest;
import com.cobuild.backend.skill.dto.response.SkillResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse addSkill(
            @Valid @RequestBody CreateSkillRequest request) {

        return skillService.addSkill(request);
    }

    @GetMapping
    public List<SkillResponse> getMySkills() {

        return skillService.getMySkills();
    }

    @PutMapping("/{skillId}")
    public SkillResponse updateSkill(
            @PathVariable Long skillId,
            @Valid @RequestBody CreateSkillRequest request) {

        return skillService.updateSkill(skillId, request);
    }

    @DeleteMapping("/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(
            @PathVariable Long skillId) {

        skillService.deleteSkill(skillId);
    }
}