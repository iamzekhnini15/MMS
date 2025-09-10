-- Migration pour remplacer idSubject par idCourse dans timetable_entries

-- Ajouter la nouvelle colonne idCourse
ALTER TABLE timetable_entries ADD COLUMN idCourse BIGINT;

-- Mettre à jour les données existantes: pour chaque subject, utiliser son course
UPDATE timetable_entries 
SET idCourse = (
    SELECT s.idCourse 
    FROM subjects s 
    WHERE s.idSubject = timetable_entries.idSubject
);

-- Ajouter la contrainte de clé étrangère
ALTER TABLE timetable_entries 
ADD CONSTRAINT FK_timetable_entries_course 
FOREIGN KEY (idCourse) REFERENCES courses(idCourse);

-- Rendre la colonne non nullable
ALTER TABLE timetable_entries ALTER COLUMN idCourse SET NOT NULL;

-- Supprimer l'ancienne contrainte et colonne idSubject
ALTER TABLE timetable_entries DROP CONSTRAINT fka6frmng0xgpxj9rkpys6gfprf;
ALTER TABLE timetable_entries DROP COLUMN idSubject;
