-- ============================================================
-- Agent Observability Platform — MySQL 初始化脚本
-- 数据库: agent
-- ============================================================

USE agent;

-- -----------------------------------------------------------
-- 1. 建表: schedules
-- -----------------------------------------------------------
DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
    id          INT           NOT NULL AUTO_INCREMENT,
    parent_id   INT           DEFAULT NULL,
    goal        TEXT          DEFAULT NULL,
    level       VARCHAR(32)   DEFAULT NULL,
    title       VARCHAR(255)  NOT NULL,
    description TEXT          DEFAULT NULL,
    type        VARCHAR(32)   NOT NULL,
    sort_order  INT           NOT NULL DEFAULT 0,
    status      VARCHAR(32)   NOT NULL DEFAULT 'todo',
    due_date    VARCHAR(32)   DEFAULT NULL,
    start_time  VARCHAR(32)   DEFAULT NULL,

    PRIMARY KEY (id),
    INDEX idx_parent_id  (parent_id),
    INDEX idx_type        (type),
    INDEX idx_status      (status),

    CONSTRAINT fk_schedules_parent
        FOREIGN KEY (parent_id) REFERENCES schedules (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. 建表: tool_links
-- -----------------------------------------------------------
DROP TABLE IF EXISTS tool_links;

CREATE TABLE tool_links (
    id         INT          NOT NULL AUTO_INCREMENT,
    group_id   VARCHAR(32)  NOT NULL,
    label      VARCHAR(255) NOT NULL,
    href       VARCHAR(512) NOT NULL,
    sort_order INT          NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    INDEX idx_tool_links_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. 插入种子数据（与 seed_mock_schedules 逻辑一致）
-- -----------------------------------------------------------

-- 年度根节点  id=1
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status)
VALUES (1, NULL,
        '2026年我要学完Java后端开发',
        'yearly',
        '2026年学完Java后端开发',
        '从 Spring Boot、数据库、接口联调到部署上线，形成完整后端能力。',
        'yearly', 0, 'doing');

-- Q1 月节点  id=2
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status)
VALUES (2, 1,
        '2026年我要学完Java后端开发', 'yearly',
        'Q1：Spring Boot 与 Web 基础',
        '掌握 REST API、分层结构和本地调试。',
        'monthly', 0, 'doing');

-- Q2 月节点  id=3
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status)
VALUES (3, 1,
        '2026年我要学完Java后端开发', 'yearly',
        'Q2：数据库与工程化',
        '学习 SQLAlchemy、迁移、测试和项目结构。',
        'monthly', 1, 'todo');

-- Q3 月节点  id=4
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status)
VALUES (4, 1,
        '2026年我要学完Java后端开发', 'yearly',
        'Q3：部署与可观测',
        '完成 Docker、日志、监控和告警实践。',
        'monthly', 2, 'todo');

-- Q1 下的 daily 任务  id=5,6,7
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status, due_date, start_time)
VALUES
(5, 2, '2026年我要学完Java后端开发', 'yearly',
 '学习 Spring Boot 路由', '可在今日任务中修改状态和内容。',
 'daily', 0, 'done', '2026-01-01', '08:00'),

(6, 2, '2026年我要学完Java后端开发', 'yearly',
 '完成 Agent 联调', '可在今日任务中修改状态和内容。',
 'daily', 1, 'todo', '2026-01-01', '10:00'),

(7, 2, '2026年我要学完Java后端开发', 'yearly',
 '复盘并整理笔记', '可在今日任务中修改状态和内容。',
 'daily', 2, 'todo', '2026-01-01', '18:00');

-- Q2 下的 daily 任务  id=8,9,10
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status, due_date, start_time)
VALUES
(8, 3, '2026年我要学完Java后端开发', 'yearly',
 '学习 Spring Boot 路由', '可在今日任务中修改状态和内容。',
 'daily', 0, 'todo', '2026-01-01', '08:00'),

(9, 3, '2026年我要学完Java后端开发', 'yearly',
 '完成 Agent 联调', '可在今日任务中修改状态和内容。',
 'daily', 1, 'todo', '2026-01-01', '10:00'),

(10, 3, '2026年我要学完Java后端开发', 'yearly',
 '复盘并整理笔记', '可在今日任务中修改状态和内容。',
 'daily', 2, 'todo', '2026-01-01', '18:00');

-- Q3 下的 daily 任务  id=11,12,13
INSERT INTO schedules (id, parent_id, goal, level, title, description, type, sort_order, status, due_date, start_time)
VALUES
(11, 4, '2026年我要学完Java后端开发', 'yearly',
 '学习 Spring Boot 路由', '可在今日任务中修改状态和内容。',
 'daily', 0, 'todo', '2026-01-01', '08:00'),

(12, 4, '2026年我要学完Java后端开发', 'yearly',
 '完成 Agent 联调', '可在今日任务中修改状态和内容。',
 'daily', 1, 'todo', '2026-01-01', '10:00'),

(13, 4, '2026年我要学完Java后端开发', 'yearly',
 '复盘并整理笔记', '可在今日任务中修改状态和内容。',
 'daily', 2, 'todo', '2026-01-01', '18:00');
