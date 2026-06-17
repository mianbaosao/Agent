CREATE TABLE IF NOT EXISTS schedules (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    parent_id INT DEFAULT NULL,
    goal TEXT DEFAULT NULL,
    level VARCHAR(32) DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    type VARCHAR(32) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'todo',
    due_date VARCHAR(32) DEFAULT NULL,
    start_time VARCHAR(32) DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_schedules_user_id (user_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    CONSTRAINT fk_schedules_parent
        FOREIGN KEY (parent_id) REFERENCES schedules (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tool_links (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    group_id VARCHAR(32) NOT NULL,
    label VARCHAR(255) NOT NULL,
    href VARCHAR(512) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_tool_links_user_id (user_id),
    INDEX idx_tool_links_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    account VARCHAR(20) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_account (account)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(128) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_sessions_token (token),
    INDEX idx_user_sessions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_agent_messages (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    action VARCHAR(64) DEFAULT NULL,
    schedule_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_site_agent_messages_user_id (user_id),
    INDEX idx_site_agent_messages_created_at (created_at),
    INDEX idx_site_agent_messages_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS health_profiles (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    current_weight DOUBLE DEFAULT NULL,
    target_weight DOUBLE DEFAULT NULL,
    daily_protein DOUBLE DEFAULT NULL,
    daily_carbs DOUBLE DEFAULT NULL,
    daily_fat DOUBLE DEFAULT NULL,
    daily_calories DOUBLE DEFAULT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_health_profiles_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS health_diet_entries (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    entry_date VARCHAR(16) NOT NULL,
    meal_type VARCHAR(32) DEFAULT NULL,
    food_name VARCHAR(255) NOT NULL,
    amount VARCHAR(128) DEFAULT NULL,
    protein DOUBLE DEFAULT NULL,
    carbs DOUBLE DEFAULT NULL,
    fat DOUBLE DEFAULT NULL,
    calories DOUBLE DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_health_diet_entries_user_id (user_id),
    INDEX idx_health_diet_entries_date (entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS health_food_items (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    serving VARCHAR(128) DEFAULT NULL,
    protein DOUBLE DEFAULT NULL,
    carbs DOUBLE DEFAULT NULL,
    fat DOUBLE DEFAULT NULL,
    calories DOUBLE DEFAULT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_health_food_items_user_id (user_id),
    INDEX idx_health_food_items_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS health_training_plans (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    plan_date VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'todo',
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_health_training_plans_user_id (user_id),
    INDEX idx_health_training_plans_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS health_weight_records (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    record_date VARCHAR(16) NOT NULL,
    weight DOUBLE NOT NULL,
    note VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_health_weight_records_user_date (user_id, record_date),
    INDEX idx_health_weight_records_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
