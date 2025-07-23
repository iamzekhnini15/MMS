-- Test data for bulletin periods
INSERT INTO bulletin_periods (name, start_date, end_date, active, academic_year) VALUES
('Période 1 - 2024/2025', '2024-09-01', '2024-12-20', true, '2024-2025'),
('Période 2 - 2024/2025', '2025-01-07', '2025-03-28', false, '2024-2025'),
('Période 3 - 2024/2025', '2025-04-14', '2025-06-30', false, '2024-2025');

-- Test data for some evaluations
INSERT INTO evaluations (title, description, evaluation_date, subject_id, class_id, teacher_id, is_visible, grades_visible) VALUES
('Évaluation Math 1', 'Première évaluation de mathématiques', '2024-10-15', 1, 1, 1, true, true),
('Évaluation Français 1', 'Première évaluation de français', '2024-10-20', 2, 1, 2, true, true);
