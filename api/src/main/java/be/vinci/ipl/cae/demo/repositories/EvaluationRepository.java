package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Evaluation entities.
 */
@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

  /**
   * Find evaluations by subject and class.
   *
   * @param subject the subject
   * @param classEntity the class
   * @return list of evaluations
   */
  List<Evaluation> findBySubjectAndClassEntity(Subject subject, ClassEntity classEntity);

  /**
   * Find evaluations by subject, class and period.
   *
   * @param subject the subject
   * @param classEntity the class
   * @param period the bulletin period
   * @return list of evaluations
   */
  List<Evaluation> findBySubjectAndClassEntityAndBulletinPeriod(
      Subject subject,
      ClassEntity classEntity,
      BulletinPeriod period
  );

  /**
   * Find evaluations by teacher.
   *
   * @param teacher the teacher
   * @return list of evaluations
   */
  List<Evaluation> findByTeacher(Teacher teacher);

  /**
   * Find visible evaluations for students by class and period.
   *
   * @param classEntity the class
   * @param period the bulletin period
   * @return list of visible evaluations
   */
  @Query("SELECT e FROM Evaluation e WHERE e.classEntity = :classEntity "
      + "AND e.bulletinPeriod = :period "
      + "AND e.isVisible = true"
  )
  List<Evaluation> findVisibleEvaluationsByClassAndPeriod(
      @Param("classEntity") ClassEntity classEntity,
      @Param("period") BulletinPeriod period
  );

  /**
   * Find evaluations by class and period.
   *
   * @param classEntity the class
   * @param period the bulletin period
   * @return list of evaluations
   */
  List<Evaluation> findByClassEntityAndBulletinPeriod(
      ClassEntity classEntity,
      BulletinPeriod period
  );
}
