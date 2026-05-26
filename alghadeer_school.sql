-- =============================================================
--  مدرسة الغدير — AlGhadeer School Management System
--  Database: school
--  Generated: 2026-05-22
--  Import via phpMyAdmin → select database "school" → SQL tab
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- =============================================================
-- 1. USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255)                        NOT NULL,
  email          VARCHAR(255)                        NOT NULL UNIQUE,
  password       VARCHAR(255)                        NOT NULL,
  role           ENUM('admin','teacher','student')   NOT NULL DEFAULT 'student',
  phone          VARCHAR(30),
  parent_phone   VARCHAR(30),
  address        TEXT,
  date_of_birth  DATE,
  avatar         VARCHAR(500),
  class_id       INT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin account  (password: admin123)
INSERT IGNORE INTO users (name, email, password, role)
VALUES ('المدير', 'admin@school.com', 'admin123', 'admin');

-- =============================================================
-- 2. CLASSES
-- =============================================================
CREATE TABLE IF NOT EXISTS classes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  grade_level    VARCHAR(100),
  teacher_id     INT DEFAULT NULL,          -- kept for legacy, not actively used
  academic_year  VARCHAR(20)  DEFAULT '2025-2026',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================
-- 3. SUBJECTS  (مواد كل صف)
-- =============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT          NOT NULL,
  teacher_id     INT          DEFAULT NULL,
  name           VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE SET NULL
);

-- =============================================================
-- 4. LECTURES  (الجدول الأسبوعي)
-- =============================================================
CREATE TABLE IF NOT EXISTS lectures (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT          NOT NULL,
  teacher_id     INT          DEFAULT NULL,
  subject_name   VARCHAR(255) NOT NULL,
  day_of_week    ENUM('sunday','monday','tuesday','wednesday','thursday') NOT NULL,
  start_time     TIME         NOT NULL,
  end_time       TIME         NOT NULL,
  room           VARCHAR(100),
  academic_year  VARCHAR(20)  DEFAULT '2025-2026',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE SET NULL
);

-- =============================================================
-- 5. ANNOUNCEMENTS  (الإعلانات)
-- =============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  content        TEXT         NOT NULL,
  author_id      INT          DEFAULT NULL,
  category       VARCHAR(100) DEFAULT 'general',
  target_role    ENUM('all','teacher','student') DEFAULT 'all',
  is_pinned      TINYINT(1)   DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================
-- 6. EVENTS  (التقويم المدرسي)
-- =============================================================
CREATE TABLE IF NOT EXISTS events (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  event_date     DATE         NOT NULL,
  event_type     ENUM('holiday','exam','activity','meeting','other') DEFAULT 'other',
  created_by     INT          DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================
-- 7. EXAM SCHEDULE  (جدول الامتحانات)
-- =============================================================
CREATE TABLE IF NOT EXISTS exam_schedule (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  class_id       INT          DEFAULT NULL,
  subject_name   VARCHAR(255) NOT NULL,
  exam_date      DATE         NOT NULL,
  start_time     TIME         NOT NULL,
  end_time       TIME         NOT NULL,
  room           VARCHAR(100),
  semester       ENUM('first','second','final') DEFAULT 'first',
  academic_year  VARCHAR(20)  DEFAULT '2025-2026',
  notes          TEXT,
  created_by     INT          DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
);

-- =============================================================
-- 8. CLASS MATERIALS  (المواد التعليمية)
-- =============================================================
CREATE TABLE IF NOT EXISTS class_materials (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT          NOT NULL,
  teacher_id     INT          NOT NULL,
  subject_id     INT          DEFAULT NULL,
  title          VARCHAR(255) NOT NULL,
  body           TEXT,
  type           ENUM('video','document','text','image') NOT NULL DEFAULT 'text',
  file_url       VARCHAR(500),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- =============================================================
-- 9. GRADES  (العلامات)
-- =============================================================
CREATE TABLE IF NOT EXISTS grades (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT             NOT NULL,
  subject_id     INT             NOT NULL,
  score          DECIMAL(6,2)    NOT NULL DEFAULT 0,
  max_score      DECIMAL(6,2)    NOT NULL DEFAULT 100,
  semester       ENUM('first','second','final') NOT NULL DEFAULT 'first',
  academic_year  VARCHAR(20)     NOT NULL DEFAULT '2025-2026',
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade (student_id, subject_id, semester, academic_year),
  FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- =============================================================
-- 10. ATTENDANCE  (الحضور والغياب)
-- =============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT          NOT NULL,
  class_id       INT          NOT NULL,
  date           DATE         NOT NULL,
  status         ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
  recorded_by    INT          DEFAULT NULL,
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance (student_id, class_id, date),
  FOREIGN KEY (student_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (class_id)    REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id)   ON DELETE SET NULL
);

-- =============================================================
-- 11. CLASSROOMS  (تخطيط الغرف)
-- =============================================================
CREATE TABLE IF NOT EXISTS classrooms (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT NOT NULL UNIQUE,
  rows_count     INT NOT NULL DEFAULT 5,
  cols_count     INT NOT NULL DEFAULT 6,
  notes          VARCHAR(255),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- =============================================================
-- 12. SEAT ALLOCATIONS  (توزيع المقاعد)
-- =============================================================
CREATE TABLE IF NOT EXISTS class_seat_allocations (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  class_id       INT NOT NULL,
  student_id     INT NOT NULL,
  seat_number    INT NOT NULL,
  row_num        INT NOT NULL,
  col_num        INT NOT NULL,
  health_type    ENUM('none','vision','hearing','mobility','other') DEFAULT 'none',
  health_note    VARCHAR(255),
  assigned_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student    (student_id),
  UNIQUE KEY uq_class_seat (class_id, row_num, col_num),
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE
);

-- =============================================================
-- 13. SUBJECT CATALOG  (قائمة المواد المرجعية)
--     This is the master list the admin chooses from when
--     adding subjects to a class. Edit freely in phpMyAdmin.
-- =============================================================
CREATE TABLE IF NOT EXISTS subject_catalog (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default subject names (edit or add more as needed)
INSERT IGNORE INTO subject_catalog (name) VALUES
  ('اللغة العربية'),
  ('اللغة الإنجليزية'),
  ('اللغة الفرنسية'),
  ('الرياضيات'),
  ('العلوم'),
  ('الفيزياء'),
  ('الكيمياء'),
  ('الأحياء'),
  ('التاريخ'),
  ('الجغرافيا'),
  ('التربية الوطنية'),
  ('التربية الإسلامية'),
  ('التربية المسيحية'),
  ('الفلسفة'),
  ('علم النفس والاجتماع'),
  ('الاقتصاد'),
  ('المحاسبة'),
  ('الحاسوب وتقنية المعلومات'),
  ('التربية الفنية'),
  ('التربية الموسيقية'),
  ('التربية البدنية');

SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================
-- USEFUL QUERIES  (استعلامات مفيدة)
-- =============================================================

-- ── View all subjects with class & teacher ─────────────────────────────────
-- SELECT s.id, s.name AS subject_name, c.name AS class_name,
--        c.grade_level, u.name AS teacher_name
-- FROM subjects s
-- LEFT JOIN classes c ON c.id = s.class_id
-- LEFT JOIN users   u ON u.id = s.teacher_id
-- ORDER BY c.grade_level, c.name, s.name;

-- ── Rename a subject ───────────────────────────────────────────────────────
-- UPDATE subjects SET name = 'الاسم الجديد' WHERE id = ?;

-- ── Assign a teacher to a subject ─────────────────────────────────────────
-- UPDATE subjects SET teacher_id = ? WHERE id = ?;

-- ── Remove teacher from a subject ─────────────────────────────────────────
-- UPDATE subjects SET teacher_id = NULL WHERE id = ?;

-- ── Subjects without a teacher ────────────────────────────────────────────
-- SELECT s.id, s.name, c.name AS class_name
-- FROM subjects s JOIN classes c ON c.id = s.class_id
-- WHERE s.teacher_id IS NULL ORDER BY c.name, s.name;

-- ── All grades with student, subject, class ────────────────────────────────
-- SELECT g.id, u.name AS student, s.name AS subject,
--        c.name AS class, g.score, g.max_score,
--        ROUND(g.score/g.max_score*100,1) AS pct,
--        g.semester, g.academic_year
-- FROM grades g
-- JOIN users    u ON u.id = g.student_id
-- JOIN subjects s ON s.id = g.subject_id
-- JOIN classes  c ON c.id = s.class_id
-- ORDER BY c.name, u.name;

-- ── Attendance summary per student ────────────────────────────────────────
-- SELECT u.name, c.name AS class_name,
--        SUM(a.status='present') AS present,
--        SUM(a.status='absent')  AS absent,
--        SUM(a.status='late')    AS late
-- FROM attendance a
-- JOIN users   u ON u.id = a.student_id
-- JOIN classes c ON c.id = a.class_id
-- GROUP BY u.id, u.name, c.name
-- ORDER BY c.name, u.name;
