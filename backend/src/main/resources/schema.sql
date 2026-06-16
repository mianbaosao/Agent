CREATE TABLE IF NOT EXISTS tool_links (
    id INT NOT NULL AUTO_INCREMENT,
    group_id VARCHAR(32) NOT NULL,
    label VARCHAR(255) NOT NULL,
    href VARCHAR(512) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_tool_links_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_agent_messages (
    id INT NOT NULL AUTO_INCREMENT,
    role VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    action VARCHAR(64) DEFAULT NULL,
    schedule_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_site_agent_messages_created_at (created_at),
    INDEX idx_site_agent_messages_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
