package com.cobuild.backend.role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "role_skills")
public class RoleSkill {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private ProjectRole role;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    // ----- Constructors -----

    public RoleSkill() {
        // required by JPA
    }

    public RoleSkill(ProjectRole role, String skillName) {
        this.role = role;
        this.skillName = skillName;
    }

    // ----- Getters & Setters -----

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProjectRole getRole() {
        return role;
    }

    public void setRole(ProjectRole role) {
        this.role = role;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    // ----- equals/hashCode/toString -----

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RoleSkill)) return false;
        RoleSkill that = (RoleSkill) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "RoleSkill{" +
                "id=" + id +
                ", skillName='" + skillName + '\'' +
                '}';
    }
}