INSERT INTO addresses (id_address, street, number, box, postal_code, commune, country) VALUES
                                                                                           (1, 'Rue de la Loi', '16', NULL, '1000', 'Bruxelles', 'Belgique'),
                                                                                           (2, 'Avenue Louise', '231', 'B', '1050', 'Ixelles', 'Belgique');

INSERT INTO users (id_user, email, password, lastname, firstname, phone, role, civility, registration_date, address) VALUES
                                                                                                                         (1, 'alice@school.be', 'hashedpwd1', 'Dupont', 'Alice', '0478123456', 'TEACHER', 'Mme', NOW(), 1),
                                                                                                                         (2, 'bob@school.be', 'hashedpwd2', 'Martin', 'Bob', '0478567890', 'TEACHER', 'M.', NOW(), 2);

INSERT INTO teachers (id_teacher, specialities, contract_type, is_full_time, availability, id_user) VALUES
                                                                                                        (1, 'Mathématiques,Physique', 'CDI', true, 'Lundi-Vendredi', 1),
                                                                                                        (2, 'Français,Histoire', 'CDD', false, 'Lundi-Mercredi', 2);

INSERT INTO subjects (id_subject, name, description, coefficient) VALUES
                                                                      (1, 'Mathématiques', 'Cours de mathématiques générales', 3),
                                                                      (2, 'Physique', 'Cours de physique de base', 2),
                                                                      (3, 'Français', 'Grammaire, orthographe et littérature', 2);

INSERT INTO teachersubjects (id_teacher, id_subject) VALUES
                                                         (1, 1), -- Alice enseigne Mathématiques
                                                         (1, 2), -- Alice enseigne Physique
                                                         (2, 3); -- Bob enseigne Français

INSERT INTO classrooms (id_classroom, name, level) VALUES
                                                       (1, 'Salle A1', 'Secondaire 1'),
                                                       (2, 'Salle B2', 'Secondaire 2');

INSERT INTO courses (id_course, id_subject, id_teacher, id_classroom, start_date, end_date) VALUES
                                                                                                (1, 1, 1, 1, '2025-09-02 08:00:00', '2025-09-02 10:00:00'),
                                                                                                (2, 3, 2, 2, '2025-09-02 10:00:00', '2025-09-02 12:00:00');


