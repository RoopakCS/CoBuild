package com.cobuild.backend.application;

import com.cobuild.backend.application.dto.ApplicationResponse;
import com.cobuild.backend.application.dto.CreateApplicationRequest;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectRepository;
import com.cobuild.backend.project.ProjectStatus;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;

import java.net.Authenticator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public ApplicationResponse apply(
            UUID projectId, String applicantEmail, CreateApplicationRequest request) {
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new RuntimeException("This project is not accepting applications");
        }

        User applicant = userRepository
                .findByEmail(applicantEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UUID applicantId = applicant.getId();

        if (project.getOwner().getId().equals(applicantId)) {
            throw new RuntimeException("You cannot apply to your own project");
        }

        boolean alreadyApplied = applicationRepository.existsByProjectIdAndApplicantId(projectId, applicantId);

        if (alreadyApplied) {
            throw new RuntimeException("You have already applied to this project");
        }

        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .applicant(applicant)
                .message(request.message())
                .status(ApplicationStatus.PENDING)
                .build();

        ProjectApplication savedApplication = applicationRepository.save(application);

        return mapToResponse(savedApplication);
    }

    private ApplicationResponse mapToResponse(ProjectApplication application) {
        return new ApplicationResponse(
                application.getId(),
                application.getProject().getId(),
                application.getProject().getTitle(),
                application.getApplicant().getId(),
                application.getApplicant().getName(),
                application.getMessage(),
                application.getStatus(),
                application.getCreatedAt(),
                application.getUpdatedAt());
    }

    public List<ApplicationResponse> getProjectApplications(UUID projectId, String userEmail) {
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getOwner().getId().equals(user.getId())) {

            throw new RuntimeException("You are not authorized to view applications for this project");
        }

        return applicationRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ApplicationResponse> getUserApplications(String userEmail) {
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return applicationRepository.findByApplicantId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ApplicationResponse updateApplication(UUID applicationId, ApplicationStatus newStatus, String userEmail) {
        // Find the application
        ProjectApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found"));

        // Find the authenticated user
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found"));

        // Check whether authenticated user owns the project
        if (!application
                .getProject()
                .getOwner()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to update this application");
        }

        // Only pending applications can be processed
        if (application.getStatus() != ApplicationStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending applications can be updated");
        }

        // Owner can only accept or reject
        if (newStatus != ApplicationStatus.ACCEPTED
                && newStatus != ApplicationStatus.REJECTED) {

            throw new RuntimeException(
                    "Application can only be accepted or rejected");
        }

        // Update status
        application.setStatus(newStatus);

        ProjectApplication savedApplication = applicationRepository.save(application);

        return mapToResponse(savedApplication);
    }

    public ApplicationResponse withdrawApplication(UUID applicationId, String userEmail) {
        // Find application
        ProjectApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() -> new RuntimeException(
                        "Application not found"));

        // Find authenticated user
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found"));

        // Check whether authenticated user is the applicant
        if (!application
                .getApplicant()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to withdraw this application");
        }

        // Only pending applications can be withdrawn
        if (application.getStatus() != ApplicationStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending applications can be withdrawn");
        }

        // Update status
        application.setStatus(
                ApplicationStatus.WITHDRAWN);

        ProjectApplication savedApplication = applicationRepository.save(application);

        return mapToResponse(savedApplication);
    }
}
