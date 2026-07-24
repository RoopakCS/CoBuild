# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
General tech community members, including students, professionals, and makers, looking to collaborate on side projects. They are typically seeking teammates with complementary skills or looking to join exciting early-stage ideas.

## Product Purpose
CoBuild transforms generic project postings into a structured, role-based team recruitment platform. It exists to solve the "finding a co-builder" problem for side projects by making it easy to define specific team needs and apply for defined roles. Success means users successfully forming capable teams and launching their collaborative projects.

## Positioning
Unlike generic forums or task-management boards, CoBuild specifically enforces role-based recruitment with automated capacity handling (e.g., auto-rejecting applications when a role fills up) and multi-facet skill matching, making it purpose-built for assembling tech project teams.

## Operating Context
Users operate in a project-discovery and team-assembly mindset. Workflows involve searching for projects by skills/domain, reviewing project details, submitting applications for specific roles (e.g., Frontend Developer, Backend Engineer), and project owners reviewing and accepting/rejecting these applications to form a team.

## Capabilities and Constraints
- Built with React, Tailwind CSS, and a Spring Boot backend.
- Role-based application system with strict capacity enforcement (`filledCount` vs `openingsCount`).
- Multi-facet search by domain, experience level, and skills.
- Legacy applications are migrated to a "General Contributor" role to ensure backward compatibility.

## Brand Commitments
Name: CoBuild.
Tone: Collaborative, professional yet approachable, community-focused.

## Evidence on Hand
- Frontend codebase in `frontend/` (React/Vite).
- Backend codebase in `backend/` (Spring Boot).
- Detailed technical implementation plan in `cobuild_v1_implementation_plan_detailed.md`.
- No existing user testimonials or fabricated marketing claims to be used.

## Product Principles
1. **Role Clarity**: Every collaboration opportunity must be clearly defined by a role and required skills, avoiding ambiguous team-building.
2. **Frictionless Matching**: The system should proactively help users find relevant projects based on their skills (any-match logic).
3. **Automated Team Management**: Less administrative overhead for project owners (e.g., auto-rejecting when full, clear status transitions).
