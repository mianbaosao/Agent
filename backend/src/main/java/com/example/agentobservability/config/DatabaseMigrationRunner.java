package com.example.agentobservability.config;

import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseMigrationRunner implements ApplicationRunner {
    private final JdbcTemplate jdbc;

    public DatabaseMigrationRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        createAuthTables();
        List<String> tables = List.of(
            "schedules",
            "tool_links",
            "site_agent_messages",
            "health_profiles",
            "health_diet_entries",
            "health_food_items",
            "health_training_plans",
            "health_weight_records"
        );
        for (String table : tables) {
            addColumnIfMissing(table, "user_id", "INT NOT NULL DEFAULT 1");
            addIndexIfMissing(table, "idx_" + table + "_user_id", "user_id");
        }
        normalizeWeightRecordIndexes();
    }

    private void createAuthTables() {
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT,
                account VARCHAR(20) NOT NULL,
                password_hash VARCHAR(256) NOT NULL,
                salt VARCHAR(64) NOT NULL,
                role VARCHAR(32) NOT NULL DEFAULT 'user',
                created_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uk_users_account (account)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """);
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                token VARCHAR(128) NOT NULL,
                created_at DATETIME NOT NULL,
                expires_at DATETIME NOT NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uk_user_sessions_token (token),
                INDEX idx_user_sessions_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """);
    }

    private void addColumnIfMissing(String table, String column, String definition) {
        Integer count = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
            """, Integer.class, table, column);
        if (count != null && count == 0) {
            jdbc.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
        }
    }

    private void addIndexIfMissing(String table, String index, String column) {
        Integer count = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
            """, Integer.class, table, index);
        if (count != null && count == 0) {
            jdbc.execute("CREATE INDEX " + index + " ON " + table + " (" + column + ")");
        }
    }

    private void normalizeWeightRecordIndexes() {
        if (indexExists("health_weight_records", "uk_health_weight_records_date")) {
            jdbc.execute("ALTER TABLE health_weight_records DROP INDEX uk_health_weight_records_date");
        }
        if (!indexExists("health_weight_records", "uk_health_weight_records_user_date")) {
            jdbc.execute("ALTER TABLE health_weight_records ADD UNIQUE KEY uk_health_weight_records_user_date (user_id, record_date)");
        }
    }

    private boolean indexExists(String table, String index) {
        Integer count = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?
            """, Integer.class, table, index);
        return count != null && count > 0;
    }
}
