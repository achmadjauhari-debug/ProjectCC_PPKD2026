-- Skema sesuai ERD: users, channels, contents, content_checklists, content_metrics

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'creator',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_role CHECK (role IN ('creator','editor','admin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS channels (
  id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT       NOT NULL,
  platform    VARCHAR(30)  NOT NULL,
  handle_name VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_channels_user_platform_handle (user_id, platform, handle_name),
  CONSTRAINT fk_channels_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_channels_platform CHECK (platform IN ('youtube','tiktok','instagram','linkedin'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contents (
  id             BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT       NOT NULL,
  channel_id     BIGINT       NOT NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT         NULL,
  script_draft   TEXT         NULL,
  format_type    VARCHAR(30)  NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'idea',
  priority       VARCHAR(10)  NOT NULL DEFAULT 'medium',
  scheduled_date DATE         NULL,
  published_date DATE         NULL,
  published_url  VARCHAR(255) NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_contents_user_status (user_id, status),
  KEY idx_contents_channel (channel_id),
  KEY idx_contents_scheduled (scheduled_date),
  CONSTRAINT fk_contents_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_contents_channel FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
  CONSTRAINT chk_contents_format   CHECK (format_type IN ('short_video','long_video','carousel','single_post')),
  CONSTRAINT chk_contents_status   CHECK (status IN ('idea','scripting','recording','editing','ready','published')),
  CONSTRAINT chk_contents_priority CHECK (priority IN ('low','medium','high')),
  CONSTRAINT chk_contents_published_url CHECK (status <> 'published' OR published_url IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS content_checklists (
  id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content_id   BIGINT       NOT NULL,
  task_name    VARCHAR(255) NOT NULL,
  is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_checklists_content (content_id),
  CONSTRAINT fk_checklists_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS content_metrics (
  id             BIGINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content_id     BIGINT    NOT NULL,
  recorded_at    DATE      NOT NULL,
  views_count    INT       NOT NULL DEFAULT 0,
  likes_count    INT       NOT NULL DEFAULT 0,
  comments_count INT       NOT NULL DEFAULT 0,
  shares_count   INT       NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_metrics_content_date (content_id, recorded_at),
  CONSTRAINT fk_metrics_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
