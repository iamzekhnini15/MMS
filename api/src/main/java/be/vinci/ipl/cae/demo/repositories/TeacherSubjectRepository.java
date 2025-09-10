package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TeacherSubject;
import be.vinci.ipl.cae.demo.models.entities.TeacherSubjectId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for TeacherSubject entity operations.
 */
@Repository
public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, TeacherSubjectId> {
  
  /**
   * Find all teacher-subject associations for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @return list of teacher subjects
   */
  List<TeacherSubject> findByTeacherIdTeacher(Long teacherId);
  
  /**
   * Find all teacher-subject associations for a specific subject.
   *
   * @param subjectId the subject ID
   * @return list of teacher subjects
   */
  List<TeacherSubject> findBySubjectIdSubject(Long subjectId);
}
