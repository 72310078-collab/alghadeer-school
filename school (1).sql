-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2026 at 01:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) DEFAULT NULL,
  `category` enum('general','academic','event','urgent') DEFAULT 'general',
  `target_role` enum('all','students','teachers') DEFAULT 'all',
  `is_pinned` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `author_id`, `category`, `target_role`, `is_pinned`, `created_at`) VALUES
(1, 'مرحباً بكم في مدرسة الغدير', 'نرحب بجميع الطلاب والأساتذة في بداية العام الدراسي الجديد 2024-2025. نتمنى للجميع عاماً دراسياً موفقاً ومثمراً.', NULL, 'general', 'students', 0, '2026-06-01 08:34:17'),
(3, 'اجتماع أولياء الأمور', 'يُعقد اجتماع أولياء الأمور يوم الجمعة الموافق 20/12/2024 الساعة العاشرة صباحاً.', NULL, 'event', 'all', 0, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late','excused') DEFAULT 'present',
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `student_id`, `class_id`, `date`, `status`, `recorded_by`, `created_at`, `notes`) VALUES
(1, 16, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(2, 18, 8, '2026-05-22', 'absent', 20, '2026-06-01 08:34:17', NULL),
(3, 15, 8, '2026-05-22', 'late', 20, '2026-06-01 08:34:17', NULL),
(4, 17, 8, '2026-05-22', 'excused', 20, '2026-06-01 08:34:17', NULL),
(5, 14, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(6, 12, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(7, 3, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(8, 13, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(9, 11, 8, '2026-05-22', 'present', 20, '2026-06-01 08:34:17', NULL),
(11, 16, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(12, 18, 8, '2026-05-25', 'absent', 2, '2026-06-01 08:34:17', NULL),
(13, 15, 8, '2026-05-25', 'late', 2, '2026-06-01 08:34:17', NULL),
(14, 17, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(15, 14, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(16, 12, 8, '2026-05-25', 'late', 2, '2026-06-01 08:34:17', NULL),
(17, 3, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(18, 13, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(19, 11, 8, '2026-05-25', 'present', 2, '2026-06-01 08:34:17', NULL),
(20, 16, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(21, 18, 8, '2026-06-05', 'absent', 2, '2026-06-05 14:59:53', NULL),
(22, 15, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(23, 17, 8, '2026-06-05', 'late', 2, '2026-06-05 14:59:53', NULL),
(24, 14, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(25, 12, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(26, 3, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(27, 13, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL),
(28, 11, 8, '2026-06-05', 'present', 2, '2026-06-05 14:59:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade_level` varchar(20) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `academic_year` varchar(10) DEFAULT '2024-2025',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `grade_level`, `teacher_id`, `academic_year`, `created_at`) VALUES
(1, 'الصف الأول أ', 'الأول', NULL, '2024-2025', '2026-06-01 08:34:17'),
(2, 'الصف الثاني أ', 'الثاني', NULL, '2024-2025', '2026-06-01 08:34:17'),
(3, 'الصف الثالث أ', 'الثالث', NULL, '2024-2025', '2026-06-01 08:34:17'),
(4, 'الصف الرابع أ', 'الرابع', NULL, '2024-2025', '2026-06-01 08:34:17'),
(5, 'الصف الخامس أ', 'الخامس', NULL, '2024-2025', '2026-06-01 08:34:17'),
(6, 'الصف السادس أ', 'السادس', NULL, '2024-2025', '2026-06-01 08:34:17'),
(7, 'الروضة الأولى', 'KG1', NULL, '2025-2026', '2026-06-01 08:34:17'),
(8, 'الصف السابع أ', 'السابع', NULL, '2025-2026', '2026-06-01 08:34:17'),
(9, 'الصف الثامن أ', 'الثامن', NULL, '2025-2026', '2026-06-01 08:34:17'),
(10, 'الصف التاسع أ', 'التاسع', NULL, '2025-2026', '2026-06-01 08:34:17'),
(11, 'الروضة الثانية', 'KG2', NULL, '2025-2026', '2026-06-01 08:34:17'),
(12, 'الروضة الثالثة', 'KG3', NULL, '2025-2026', '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `rows_count` int(11) NOT NULL DEFAULT 5,
  `cols_count` int(11) NOT NULL DEFAULT 6,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classrooms`
--

INSERT INTO `classrooms` (`id`, `class_id`, `rows_count`, `cols_count`, `created_at`, `notes`) VALUES
(1, 8, 4, 4, '2026-06-01 08:34:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `class_materials`
--

CREATE TABLE `class_materials` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `type` enum('video','document','text','image') NOT NULL DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_materials`
--

INSERT INTO `class_materials` (`id`, `class_id`, `teacher_id`, `title`, `body`, `type`, `file_url`, `subject_id`, `created_at`) VALUES
(5, 8, 2, 'xxx', 'dd', 'text', NULL, 13, '2026-06-01 08:34:17'),
(7, 8, 2, 'RecordingFatimaDhayni', NULL, 'video', '/uploads/materials/1779707512986-2e5nbo58ax2.mp4', 13, '2026-06-01 08:34:17'),
(9, 8, 20, 'Basic Concepts ofSets', NULL, 'video', 'https://www.youtube.com/watch?v=f6qtZgFFt68&list=PLfXpdCfxjXmZXxORjx7yAyF30-vfXwjP2', 12, '2026-06-01 08:34:17'),
(11, 8, 20, 'Math Quiz', 'chapter 1', 'text', NULL, 12, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `class_seat_allocations`
--

CREATE TABLE `class_seat_allocations` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `seat_number` int(11) NOT NULL,
  `row_num` int(11) NOT NULL,
  `col_num` int(11) NOT NULL,
  `health_type` enum('none','vision','hearing','mobility','other') DEFAULT 'none',
  `health_note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_seat_allocations`
--

INSERT INTO `class_seat_allocations` (`id`, `class_id`, `student_id`, `seat_number`, `row_num`, `col_num`, `health_type`, `health_note`, `created_at`) VALUES
(338, 8, 16, 1, 1, 1, 'vision', NULL, '2026-06-05 15:56:43'),
(339, 8, 18, 2, 1, 2, 'vision', NULL, '2026-06-05 15:56:43'),
(340, 8, 3, 3, 1, 3, 'vision', NULL, '2026-06-05 15:56:43'),
(341, 8, 12, 4, 1, 4, 'hearing', NULL, '2026-06-05 15:56:43'),
(342, 8, 14, 5, 2, 1, 'other', 'ADHD', '2026-06-05 15:56:43'),
(343, 8, 17, 6, 2, 2, 'none', NULL, '2026-06-05 15:56:43'),
(344, 8, 11, 7, 2, 3, 'none', NULL, '2026-06-05 15:56:43'),
(345, 8, 15, 8, 2, 4, 'none', NULL, '2026-06-05 15:56:43'),
(346, 8, 13, 9, 3, 1, 'none', NULL, '2026-06-05 15:56:43');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `event_type` enum('holiday','exam','activity','meeting','other') DEFAULT 'other',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `event_date`, `end_date`, `event_type`, `created_by`, `created_at`) VALUES
(1, 'بداية الفصل الدراسي الثاني', 'انطلاق الفصل الدراسي الثاني للعام 2024-2025', '2025-01-05', NULL, 'other', NULL, '2026-06-01 08:34:17'),
(2, 'الامتحانات الفصلية', 'امتحانات نهاية الفصل الأول', '2025-01-15', NULL, 'exam', NULL, '2026-06-01 08:34:17'),
(3, 'إجازة منتصف العام', 'إجازة منتصف العام الدراسي', '2025-02-10', NULL, 'holiday', NULL, '2026-06-01 08:34:17'),
(5, 'لللللل', 'لل', '2026-05-12', NULL, 'meeting', 1, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `exam_rooms`
--

CREATE TABLE `exam_rooms` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 30,
  `rows_count` int(11) NOT NULL DEFAULT 5,
  `cols_count` int(11) NOT NULL DEFAULT 6,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_rooms`
--

INSERT INTO `exam_rooms` (`id`, `name`, `capacity`, `rows_count`, `cols_count`, `notes`, `created_at`) VALUES
(1, 'القاعة الكبرى', 42, 6, 7, NULL, '2026-06-01 08:34:17'),
(2, 'قاعة أ', 30, 5, 6, NULL, '2026-06-01 08:34:17'),
(3, 'قاعة ب', 30, 5, 6, NULL, '2026-06-01 08:34:17'),
(4, 'قاعة ج', 24, 4, 6, NULL, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `exam_schedule`
--

CREATE TABLE `exam_schedule` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `subject_name` varchar(100) NOT NULL,
  `exam_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(100) DEFAULT NULL,
  `semester` enum('first','second','final') DEFAULT 'first',
  `academic_year` varchar(10) DEFAULT '2024-2025',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_schedule`
--

INSERT INTO `exam_schedule` (`id`, `title`, `class_id`, `subject_name`, `exam_date`, `start_time`, `end_time`, `room`, `semester`, `academic_year`, `notes`, `created_by`, `created_at`) VALUES
(1, 'امتحان الرياضيات', 10, 'الرياضيات', '2026-05-28', '08:00:00', '10:00:00', 'غرفة الصف الثالث', 'first', '2024-2025', 'يمنع الوصول الى الامتحان متأخرا', 1, '2026-06-01 08:34:17'),
(2, 'مسابقة الامتحان الرياضيات الفصل النهائي', 8, 'رياضيات', '2026-06-19', '08:00:00', '10:00:00', 'الصف الاول', 'final', '2024-2025', NULL, 1, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) DEFAULT 100.00,
  `semester` enum('first','second','final') DEFAULT 'first',
  `academic_year` varchar(10) DEFAULT '2024-2025',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `student_id`, `subject_id`, `score`, `max_score`, `semester`, `academic_year`, `notes`, `created_at`) VALUES
(20, 16, 12, 100.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(21, 18, 12, 90.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(22, 15, 12, 77.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(23, 17, 12, 50.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(24, 14, 12, 49.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(25, 12, 12, 88.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(26, 3, 12, 95.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(27, 13, 12, 75.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(28, 11, 12, 67.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(30, 16, 13, 77.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(31, 18, 13, 88.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(32, 15, 13, 99.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(33, 17, 13, 97.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(34, 14, 13, 75.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(35, 12, 13, 63.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(36, 3, 13, 59.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(37, 13, 13, 100.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(38, 11, 13, 56.00, 100.00, 'first', '2025-2026', NULL, '2026-06-01 08:34:17'),
(40, 12, 13, 95.00, 100.00, 'final', '2025-2026', NULL, '2026-06-05 13:18:49'),
(41, 16, 13, 90.00, 100.00, 'second', '2025-2026', NULL, '2026-06-05 13:23:52'),
(51, 11, 13, 60.00, 100.00, 'second', '2025-2026', NULL, '2026-06-05 15:56:14'),
(53, 11, 13, 55.00, 100.00, 'final', '2025-2026', NULL, '2026-06-05 15:56:28');

-- --------------------------------------------------------

--
-- Table structure for table `lectures`
--

CREATE TABLE `lectures` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `class_id` int(11) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `day_of_week` enum('sunday','monday','tuesday','wednesday','thursday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `academic_year` varchar(10) DEFAULT '2024-2025',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lectures`
--

INSERT INTO `lectures` (`id`, `teacher_id`, `class_id`, `subject_name`, `day_of_week`, `start_time`, `end_time`, `room`, `academic_year`, `created_at`) VALUES
(1, 2, 5, 'الرياضيات', 'sunday', '08:00:00', '09:00:00', '5', '2024-2025', '2026-06-01 08:34:17'),
(3, 20, 8, 'الرياضيات', 'monday', '09:40:00', '10:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(6, 2, 8, 'الجغرافيا', 'monday', '08:00:00', '08:50:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(7, 19, 8, 'الكيمياء', 'monday', '08:50:00', '09:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(8, 23, 8, 'الأحياء', 'monday', '10:30:00', '11:20:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(9, 27, 8, 'اللغة الإنجليزية', 'monday', '11:50:00', '12:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(10, 25, 8, 'اللغة العربية', 'monday', '12:40:00', '13:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(11, 26, 8, 'التربية الوطنية', 'tuesday', '08:00:00', '08:50:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(12, 22, 8, 'الفيزياء', 'tuesday', '08:50:00', '09:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(14, 25, 8, 'اللغة العربية', 'tuesday', '09:40:00', '10:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(15, 20, 8, 'الرياضيات', 'tuesday', '10:30:00', '11:20:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(16, 27, 8, 'اللغة الإنجليزية', 'tuesday', '11:50:00', '12:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(17, 29, 8, 'التربية الإسلامية', 'tuesday', '12:40:00', '13:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(18, 23, 8, 'الأحياء', 'wednesday', '08:00:00', '08:50:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(19, 24, 8, 'التاريخ', 'wednesday', '08:50:00', '09:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(20, 20, 8, 'الرياضيات', 'wednesday', '09:40:00', '10:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(21, 19, 8, 'الكيمياء', 'wednesday', '10:30:00', '11:20:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(22, 25, 8, 'اللغة العربية', 'wednesday', '11:50:00', '12:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(23, 27, 8, 'اللغة الإنجليزية', 'wednesday', '12:40:00', '13:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(24, 25, 8, 'اللغة العربية', 'thursday', '08:00:00', '08:50:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(25, 22, 8, 'الفيزياء', 'thursday', '08:50:00', '09:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(26, 27, 8, 'اللغة الإنجليزية', 'thursday', '09:40:00', '10:30:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(27, 20, 8, 'الرياضيات', 'thursday', '10:30:00', '11:20:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(28, 20, 8, 'الرياضيات', 'thursday', '11:50:00', '12:40:00', NULL, '2025-2026', '2026-06-01 08:34:17'),
(29, 27, 8, 'اللغة الإنجليزية', 'thursday', '12:40:00', '13:30:00', NULL, '2025-2026', '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `seat_allocations`
--

CREATE TABLE `seat_allocations` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `seat_number` int(11) NOT NULL,
  `row_num` int(11) NOT NULL,
  `col_num` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_classes`
--

CREATE TABLE `student_classes` (
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `catalog_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `catalog_id`, `class_id`, `teacher_id`, `created_at`) VALUES
(12, 3, 8, 20, '2026-06-01 08:34:17'),
(13, 9, 8, 2, '2026-06-01 08:34:17'),
(14, 6, 8, 19, '2026-06-01 08:34:17'),
(15, 1, 8, 25, '2026-06-01 08:34:17'),
(16, 2, 8, 27, '2026-06-01 08:34:17'),
(17, 5, 8, 22, '2026-06-01 08:34:17'),
(18, 7, 8, 23, '2026-06-01 08:34:17'),
(19, 8, 8, 24, '2026-06-01 08:34:17'),
(20, 10, 8, 26, '2026-06-01 08:34:17'),
(21, 11, 8, 29, '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `subject_catalog`
--

CREATE TABLE `subject_catalog` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_catalog`
--

INSERT INTO `subject_catalog` (`id`, `name`, `created_at`) VALUES
(1, 'اللغة العربية', '2026-06-01 08:34:17'),
(2, 'اللغة الإنجليزية', '2026-06-01 08:34:17'),
(3, 'الرياضيات', '2026-06-01 08:34:17'),
(4, 'العلوم', '2026-06-01 08:34:17'),
(5, 'الفيزياء', '2026-06-01 08:34:17'),
(6, 'الكيمياء', '2026-06-01 08:34:17'),
(7, 'الأحياء', '2026-06-01 08:34:17'),
(8, 'التاريخ', '2026-06-01 08:34:17'),
(9, 'الجغرافيا', '2026-06-01 08:34:17'),
(10, 'التربية الوطنية', '2026-06-01 08:34:17'),
(11, 'التربية الإسلامية', '2026-06-01 08:34:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','teacher','student') DEFAULT 'student',
  `class_id` int(11) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `class_id`, `avatar`, `phone`, `gender`, `parent_phone`, `address`, `date_of_birth`, `created_at`, `updated_at`) VALUES
(1, 'مدير النظام', 'admin@alghadeer.edu', 'admin2026', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(2, 'Fatima Dhayni', 'Fatima@alghadeer.edu', 'fatima2026', 'teacher', NULL, NULL, '899997', NULL, NULL, 'lebanon-ALkharayeb', NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(3, 'Moe H', 'student@alghadeer.edu', 'student2026', 'student', 8, NULL, '999', NULL, '888', NULL, '2014-06-01', '2026-06-01 08:34:17', '2026-06-01 13:13:23'),
(11, 'rokaya', 'rokaya@alghadeer.edu', 'rokaya2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, '2010-11-16', '2026-06-01 08:34:17', '2026-06-01 13:19:05'),
(12, 'lana', 'lana@alghadeer.edu', 'lan a2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(13, 'reem', 'reem@alghadeer.edu', 'reem2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(14, 'lama', 'lama@alghadeer.edu', 'lama2026', 'student', 8, NULL, '1111111111', NULL, NULL, 'ddd', NULL, '2026-06-01 08:34:17', '2026-06-05 15:07:00'),
(15, 'jawad', 'jawad@alghadeer.edu', 'jawad2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(16, 'ali', 'ali@alghadeer.edu', 'ali2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(17, 'jihad', 'jihad@alghadeer.edu', 'jihad2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(18, 'hadi', 'hadi@alghadeer.edu', 'hadi2026', 'student', 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(19, 'Hasan Dhayni', 'hasan@alghadeer.edu', 'hasan2026', 'teacher', NULL, NULL, '44537', NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(20, 'Rawan Dhayni', 'rawan@alghadeer.edu', 'rawan2026', 'teacher', NULL, NULL, '222001108', NULL, NULL, 'lebanon', NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(21, 'المدير', 'admin@school.com', 'admin123', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(22, 'jih', 'jih@alghadeer.edu', 'jih202026', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(23, 'hussein', 'hussein@alghadeer.edu', 'hussein', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(24, 'ayaa', 'aya@alghadeer.edu', 'aya', 'teacher', NULL, NULL, '3333', NULL, NULL, NULL, '1993-10-20', '2026-06-01 08:34:17', '2026-06-01 13:43:44'),
(25, 'rima', 'rima@alghadeer.edu', 'rima', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(26, 'hanan', 'hanan@alghadeer.edu', 'hanan', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(27, 'abbass', 'abbass@alghadeer.edu', 'abbass', 'teacher', NULL, NULL, '444444444', NULL, NULL, NULL, '1993-03-02', '2026-06-01 08:34:17', '2026-06-01 13:19:31'),
(28, 'jamila', 'jamila@alghadeer.edu', 'jamila', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17'),
(29, 'layla', 'layla@alghadeer.edu', 'layla', 'teacher', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-01 08:34:17', '2026-06-01 08:34:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`class_id`,`date`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classes_ibfk_1` (`teacher_id`);

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_id` (`class_id`);

--
-- Indexes for table `class_materials`
--
ALTER TABLE `class_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `class_seat_allocations`
--
ALTER TABLE `class_seat_allocations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student` (`student_id`),
  ADD UNIQUE KEY `uq_class_seat` (`class_id`,`row_num`,`col_num`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `exam_rooms`
--
ALTER TABLE `exam_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_grade` (`student_id`,`subject_id`,`semester`,`academic_year`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `seat_allocations`
--
ALTER TABLE `seat_allocations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_seat` (`exam_id`,`room_id`,`row_num`,`col_num`),
  ADD UNIQUE KEY `unique_student_exam` (`exam_id`,`student_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`student_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_subject` (`catalog_id`,`class_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `subject_catalog`
--
ALTER TABLE `subject_catalog`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `class_materials`
--
ALTER TABLE `class_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `class_seat_allocations`
--
ALTER TABLE `class_seat_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=347;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `exam_rooms`
--
ALTER TABLE `exam_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `lectures`
--
ALTER TABLE `lectures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `seat_allocations`
--
ALTER TABLE `seat_allocations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `subject_catalog`
--
ALTER TABLE `subject_catalog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD CONSTRAINT `classrooms_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_materials`
--
ALTER TABLE `class_materials`
  ADD CONSTRAINT `class_materials_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_materials_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_seat_allocations`
--
ALTER TABLE `class_seat_allocations`
  ADD CONSTRAINT `class_seat_allocations_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_seat_allocations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_schedule`
--
ALTER TABLE `exam_schedule`
  ADD CONSTRAINT `exam_schedule_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exam_schedule_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lectures`
--
ALTER TABLE `lectures`
  ADD CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lectures_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seat_allocations`
--
ALTER TABLE `seat_allocations`
  ADD CONSTRAINT `seat_allocations_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exam_schedule` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seat_allocations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seat_allocations_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `exam_rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`catalog_id`) REFERENCES `subject_catalog` (`id`),
  ADD CONSTRAINT `subjects_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subjects_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
