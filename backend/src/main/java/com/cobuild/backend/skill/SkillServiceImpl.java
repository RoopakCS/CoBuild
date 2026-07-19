package com.cobuild.backend.skill;

import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.skill.dto.request.CreateSkillRequest;
import com.cobuild.backend.skill.dto.response.SkillResponse;
import com.cobuild.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    @Override
    public SkillResponse addSkill(CreateSkillRequest request) {

        User currentUser = getCurrentUser();

        if (skillRepository.existsByUserAndName(currentUser, request.getName())) {
            throw new DuplicateResourceException("Skill already exists");
        }

        Skill skill = Skill.builder()
                .name(request.getName())
                .user(currentUser)
                .build();

        Skill savedSkill = skillRepository.save(skill);

        return mapToResponse(savedSkill);
    }

    @Override
    public List<SkillResponse> getMySkills() {

        User currentUser = getCurrentUser();

        return skillRepository.findByUser(currentUser)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SkillResponse updateSkill(Long skillId, CreateSkillRequest request) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        User currentUser = getCurrentUser();

        if (!skill.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You can only update your own skills");
        }

        skill.setName(request.getName());

        Skill updatedSkill = skillRepository.save(skill);

        return mapToResponse(updatedSkill);
    }

    @Override
    public void deleteSkill(Long skillId) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        User currentUser = getCurrentUser();

        if (!skill.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You can only delete your own skills");
        }

        skillRepository.delete(skill);
    }

    /**
     * Returns the currently authenticated user.
     */
    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new ForbiddenException("Invalid authentication principal");
        }

        return userPrincipal.getUser();
    }

    /**
     * Converts Skill entity to SkillResponse DTO.
     */
    private SkillResponse mapToResponse(Skill skill) {

        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .build();
    }
}