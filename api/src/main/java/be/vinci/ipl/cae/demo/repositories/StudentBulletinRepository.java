package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.StudentBulletin;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudentBulletin entities.
 */
@Repository
public interface StudentBulletinRepository extends JpaRepository<StudentBulletin, Long> {

  /**
   * Find bulletin by student and period.
   *
   * @param student the student
   * @param period the bulletin period
   * @return the bulletin if found
   */
  Optional<StudentBulletin> findByStudentAndBulletinPeriod(Student student, BulletinPeriod period);

  /**
   * Find all bulletins for a student.
   *
   * @param student the student
   * @return list of bulletins
   */
  List<StudentBulletin> findByStudent(Student student);

  /**
   * Find visible bulletins for a student.
   *
   * @param student the student
   * @return list of visible bulletins
   */
  List<StudentBulletin> findByStudentAndIsVisibleTrue(Student student);

  /**
   * Find all bulletins for a period.
   *
   * @param period the bulletin period
   * @return list of bulletins
   */
  List<StudentBulletin> findByBulletinPeriod(BulletinPeriod period);
}
