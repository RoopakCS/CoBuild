package com.cobuild.backend.project.specification;

import com.cobuild.backend.project.ExperienceLevel;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectStatus;
import com.cobuild.backend.role.ProjectRole;
import com.cobuild.backend.role.RoleSkill;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class ProjectSpecification {

    private ProjectSpecification() {
    }

    public static Specification<Project> hasSearch(String search) {
        return (root, query, cb) -> {

            if (search == null || search.isBlank()) {
                return null;
            }

            String keyword = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
            );
        };
    }

    public static Specification<Project> hasDomain(String domain) {

        return (root, query, cb) -> {

            if (domain == null || domain.isBlank()) {
                return null;
            }

            return cb.equal(
                    cb.lower(root.get("domain")),
                    domain.toLowerCase()
            );
        };
    }

    public static Specification<Project> hasExperienceLevel(
            ExperienceLevel level) {

        return (root, query, cb) -> {

            if (level == null) {
                return null;
            }

            return cb.equal(root.get("experienceLevel"), level);
        };
    }

    public static Specification<Project> hasStatus(
            ProjectStatus status) {

        return (root, query, cb) -> {

            if (status == null) {
                return null;
            }

            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Project> hasSkills(
            List<String> skills) {

        return (root, query, cb) -> {

            if (skills == null || skills.isEmpty()) {
                return null;
            }

            query.distinct(true);

            Join<Project, ProjectRole> roleJoin =
                    root.join("roles");

            Join<ProjectRole, RoleSkill> skillJoin =
                    roleJoin.join("skills");

            return skillJoin
                    .get("skillName")
                    .in(skills);
        };
    }

    public static Specification<Project> withFilters(
            String search,
            String domain,
            ExperienceLevel level,
            ProjectStatus status,
            List<String> skills) {

        return Specification
                .where(hasSearch(search))
                .and(hasDomain(domain))
                .and(hasExperienceLevel(level))
                .and(hasStatus(status))
                .and(hasSkills(skills));
    }

}
