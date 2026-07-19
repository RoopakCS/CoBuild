package com.cobuild.backend.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cobuild.backend.application.dto.ApplicationResponse;
import com.cobuild.backend.application.dto.CreateApplicationRequest;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public ApplicationResponse apply(UUID projectId, UUID applicantId, CreateApplicationRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User applicant = userRepository.findById(applicantId).orElseThrow(() -> new RuntimeException("User not found"));

        if (project.getOwner().getId().equals(applicantId)) {
            throw new RuntimeException("You cannot apply to your own project");
        }

        boolean alreadyApplied = applicationRepository.existsByProjectIdAndApplicantId(projectId, applicantId);

        if (alreadyApplied) {
            throw new RuntimeException("You have already applied to this project");
        }

        ProjectApplication application = ProjectApplication.builder().project(project).applicant(applicant)
                .message(request.message()).status(ApplicationStatus.PENDING).build();

        ProjectApplication savedApplication = applicationRepository.save(application);

        return mapToResponse(savedApplication);
    }

    private ApplicationResponse mapToResponse(
            ProjectApplication application) {
        return new ApplicationResponse(
                application.getId(),
                application.getProject().getId(),
                application.getApplicant().getId(),
                application.getApplicant().getName(),
                application.getMessage(),
                application.getStatus(),
                application.getCreatedAt(),
                application.getUpdatedAt());
    }

    public List<ApplicationResponse> getProjectApplications(UUID projectId) {
        List<ProjectApplication> applications = applicationRepository.findByProjectId(projectId);

        return applications.stream().map(this::mapToResponse).toList();
    }

    public List<ApplicationResponse> getUserApplications(UUID userId) {

        return applicationRepository
                .findByApplicantId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

}
