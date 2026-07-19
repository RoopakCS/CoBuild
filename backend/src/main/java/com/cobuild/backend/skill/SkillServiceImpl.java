package com.cobuild.backend.skill;

import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ForbiddenException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.skill.dto.request.CreateSkillRequest;
import com.cobuild.backend.skill.dto.response.SkillResponse;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Override
    public SkillResponse addSkill(CreateSkillRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (skillRepository.existsByUserAndName(user, request.getName())) {
            throw new DuplicateResourceException("Skill already exists");
        }

        Skill skill = Skill.builder()
                .name(request.getName())
                .user(user)
                .build();

        Skill savedSkill = skillRepository.save(skill);

        return mapToResponse(savedSkill);
    }

    @Override
    public List<SkillResponse> getMySkills() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return skillRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SkillResponse updateSkill(Long skillId, CreateSkillRequest request) {


        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        skill.setName(request.getName());

        Skill updatedSkill = skillRepository.save(skill);

        return mapToResponse(updatedSkill);
    }

    @Override
    public void deleteSkill(Long skillId) {

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Skill not found"));

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!skill.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException(
                    "You can only delete your own skills");
        }

        skillRepository.delete(skill);
    }

    private SkillResponse mapToResponse(Skill skill) {

        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .build();
    }
}