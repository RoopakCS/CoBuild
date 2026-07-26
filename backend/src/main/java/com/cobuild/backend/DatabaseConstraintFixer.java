package com.cobuild.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConstraintFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Drop the old constraint
            jdbcTemplate.execute("ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check");
            
            // Re-add it with LEAVE_PENDING
            jdbcTemplate.execute("ALTER TABLE memberships ADD CONSTRAINT memberships_status_check CHECK (status IN ('ACTIVE', 'LEFT', 'REMOVED', 'LEAVE_PENDING'))");
            
            System.out.println("Successfully updated memberships_status_check constraint!");
        } catch (Exception e) {
            System.err.println("Could not update database constraint: " + e.getMessage());
        }
    }
}
