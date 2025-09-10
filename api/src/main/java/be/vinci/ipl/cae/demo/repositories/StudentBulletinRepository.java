package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.StudentBulletin;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

  /**
   * Find bulletin by student ID and period ID.
   *
   * @param studentId the student ID
   * @param periodId the period ID
   * @return the bulletin if found
   */
  @Query("SELECT sb FROM StudentBulletin sb WHERE sb.student.idStudent = :studentId "
      + "AND sb.bulletinPeriod.idPeriod = :periodId"
  )
  Optional<StudentBulletin> findByStudentIdStudentAndBulletinPeriodIdPeriod(
      @Param("studentId") Long studentId,
      @Param("periodId") Long periodId
  );

  /**
   * Find all bulletins for a class and period.
   *
   * @param classId the class ID
   * @param periodId the period ID
   * @return list of bulletins
   */
  @Query("SELECT sb FROM StudentBulletin sb WHERE sb.student.classEntity.idClass = :classId "
      + "AND sb.bulletinPeriod.idPeriod = :periodId"
  )
  List<StudentBulletin> findByClassAndPeriod(
      @Param("classId") Long classId,
      @Param("periodId") Long periodId
  );

  /**
   * Find visible bulletins for a student ordered by period start date descending.
   *
   * @param student the student
   * @param isVisible whether the bulletin is visible
   * @return list of visible bulletins ordered by period start date descending
   */
  List<StudentBulletin> findByStudentAndIsVisibleOrderByBulletinPeriodBulletinStartDateDesc(
      Student student,
      boolean isVisible
  );
}
