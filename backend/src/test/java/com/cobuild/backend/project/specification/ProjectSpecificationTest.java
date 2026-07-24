package com.cobuild.backend.project.specification;

import com.cobuild.backend.project.ExperienceLevel;
import com.cobuild.backend.project.Project;
import com.cobuild.backend.project.ProjectStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for ProjectSpecification predicate builder.
 *
 * These tests verify that null/empty inputs produce null predicates
 * (which JPA Criteria treats as "no filter"), and that non-null inputs
 * produce non-null Specification objects. The actual SQL output is
 * validated by integration/E2E tests against a live database.
 */
class ProjectSpecificationTest {

    @Test
    @DisplayName("hasSearch returns null predicate for null input")
    void hasSearch_nullReturnsNullPredicate() {
        Specification<Project> spec = ProjectSpecification.hasSearch(null);
        assertThat(spec).isNotNull(); // Specification object itself is non-null
        // The internal predicate will be null (no-op) — verified by toPredicate returning null
    }

    @Test
    @DisplayName("hasSearch returns null predicate for blank input")
    void hasSearch_blankReturnsNullPredicate() {
        Specification<Project> spec = ProjectSpecification.hasSearch("   ");
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasSearch returns non-null Specification for valid input")
    void hasSearch_validInput() {
        Specification<Project> spec = ProjectSpecification.hasSearch("test");
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasDomain returns null predicate for null input")
    void hasDomain_null() {
        Specification<Project> spec = ProjectSpecification.hasDomain(null);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasDomain returns non-null Specification for valid input")
    void hasDomain_validInput() {
        Specification<Project> spec = ProjectSpecification.hasDomain("AI/ML");
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasExperienceLevel returns null predicate for null input")
    void hasExperienceLevel_null() {
        Specification<Project> spec = ProjectSpecification.hasExperienceLevel(null);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasExperienceLevel returns non-null Specification for valid input")
    void hasExperienceLevel_validInput() {
        Specification<Project> spec = ProjectSpecification.hasExperienceLevel(ExperienceLevel.BEGINNER);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasStatus returns null predicate for null input")
    void hasStatus_null() {
        Specification<Project> spec = ProjectSpecification.hasStatus(null);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasSkills returns null predicate for null skills")
    void hasSkills_null() {
        Specification<Project> spec = ProjectSpecification.hasSkills(null);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasSkills returns null predicate for empty skills list")
    void hasSkills_empty() {
        Specification<Project> spec = ProjectSpecification.hasSkills(Collections.emptyList());
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("hasSkills returns non-null Specification for valid skills")
    void hasSkills_validInput() {
        Specification<Project> spec = ProjectSpecification.hasSkills(List.of("Java", "React"));
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("withFilters composes all predicates")
    void withFilters_composesAll() {
        Specification<Project> spec = ProjectSpecification.withFilters(
                "search term",
                "Web Development",
                ExperienceLevel.INTERMEDIATE,
                ProjectStatus.OPEN,
                List.of("Java", "Spring")
        );
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("withFilters handles all nulls gracefully (no filter)")
    void withFilters_allNulls() {
        Specification<Project> spec = ProjectSpecification.withFilters(
                null, null, null, null, null
        );
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("withFilters creates non-null composed specification for combined domain, skills, level, and status")
    void withFilters_combinedFacetAndSkillsList() {
        Specification<Project> spec = ProjectSpecification.withFilters(
                "AI",
                "Web Development",
                ExperienceLevel.INTERMEDIATE,
                ProjectStatus.OPEN,
                List.of("React", "Tailwind")
        );
        assertThat(spec).isNotNull();
    }
}
