-- ============================================================
-- IQ ба Trauma скрининг тестийн сайт: database schema (v2)
-- MySQL 8+ | Анхааруулга: дахин ажиллуулбал хүснэгтүүд устаад
-- шинээр үүснэ (өгөгдөл арилна).
-- ============================================================

CREATE DATABASE IF NOT EXISTS psych_site
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE psych_site;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS submission_answers;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS support_resources;
DROP TABLE IF EXISTS tests;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- tests: тест бүрийн үндсэн мэдээлэл
-- ------------------------------------------------------------
CREATE TABLE tests (
  id                 INT PRIMARY KEY AUTO_INCREMENT,
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  test_type          ENUM('iq', 'trauma') NOT NULL,
  time_limit_seconds INT NULL,                -- IQ-д цаг хязгаар, trauma-д NULL
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- questions: тестийн асуултууд
-- ------------------------------------------------------------
CREATE TABLE questions (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  test_id       INT NOT NULL,
  question_text TEXT NOT NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  category      VARCHAR(30) NULL,            -- IQ: numeric | verbal | logic | math
  difficulty    TINYINT NOT NULL DEFAULT 1,  -- 1 хөнгөн, 2 дунд, 3 хүнд
  image_url     VARCHAR(500) NULL,           -- зурагтай асуулт (матриц гэх мэт)
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  INDEX idx_questions_test (test_id, sort_order)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- options: асуулт бүрийн сонголтууд
-- score: IQ-д зөв сонголт = 1 (эсвэл жин), буруу = 0
--        trauma-д 0..3 гэх мэт давтамжийн оноо
-- ------------------------------------------------------------
CREATE TABLE options (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  score       INT NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0,
  image_url   VARCHAR(500) NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_options_question (question_id, sort_order)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- results: нийт оноог ангилалд хөрвүүлэх (оноо мужаар)
-- show_support_info = TRUE бол сайт тусламжийн мэдээлэл харуулна
-- ------------------------------------------------------------
CREATE TABLE results (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  test_id           INT NOT NULL,
  min_score         INT NOT NULL,
  max_score         INT NOT NULL,
  title             VARCHAR(255) NOT NULL,
  description       TEXT,
  advice            TEXT,
  iq_estimate_min   SMALLINT NULL,  -- зөвхөн IQ тест: ойролцоо IQ-ийн доод хязгаар
  iq_estimate_max   SMALLINT NULL,  -- ойролцоо IQ-ийн дээд хязгаар
  show_support_info BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
  CHECK (min_score <= max_score),
  INDEX idx_results_test (test_id, min_score, max_score)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- support_resources: тусламжийн лавлах мэдээлэл (сэтгэл зүйч,
-- утасны дугаар). Баталгаажсан мэдээллийг л оруулна.
-- ------------------------------------------------------------
CREATE TABLE support_resources (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  phone       VARCHAR(50) NULL,
  url         VARCHAR(500) NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- submissions: нэг удаагийн тест өгөлт (НЭРГҮЙ: нэр, имэйл,
-- утас хадгалахгүй)
-- ------------------------------------------------------------
CREATE TABLE submissions (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  test_id          INT NOT NULL,
  anon_token       CHAR(36) NOT NULL UNIQUE,   -- UUID
  total_score      INT NOT NULL,
  result_id        INT NULL,
  duration_seconds INT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id)   REFERENCES tests(id),
  FOREIGN KEY (result_id) REFERENCES results(id) ON DELETE SET NULL,
  INDEX idx_submissions_test (test_id, created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- submission_answers: нэг өгөлтийн асуулт бүрийн сонгосон хариулт
-- ------------------------------------------------------------
CREATE TABLE submission_answers (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  question_id   INT NOT NULL,
  option_id     INT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id)   REFERENCES questions(id),
  FOREIGN KEY (option_id)     REFERENCES options(id),
  UNIQUE KEY uq_one_answer_per_question (submission_id, question_id)
) ENGINE=InnoDB;
