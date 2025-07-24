package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import be.vinci.ipl.cae.demo.models.entities.EvaluationGrade;
import be.vinci.ipl.cae.demo.models.entities.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


/**
 * Repository interface for EvaluationGrade entities.
 */
@Repository
public interface EvaluationGradeRepository extends JpaRepository<EvaluationGrade, Long> {

  /**
   * Find grade by evaluation and student.
   *
   * @param evaluation the evaluation
   * @param student the student
   * @return the grade if found
   */
  Optional<EvaluationGrade> findByEvaluationAndStudent(Evaluation evaluation, Student student);

  /**
   * Find all grades for an evaluation.
   *
   * @param evaluation the evaluation
   * @return list of grades
   */
  List<EvaluationGrade> findByEvaluation(Evaluation evaluation);

  /**
   * Find all grades for a student.
   *
   * @param student the student
   * @return list of grades
   */
  List<EvaluationGrade> findByStudent(Student student);

  /**
   * Find grades for a student where grades are visible.
   *
   * @param student the student
   * @return list of visible grades
   */
  @Query("SELECT eg FROM EvaluationGrade eg "
      + "JOIN FETCH eg.evaluation e "
      + "JOIN FETCH e.subject s "
      + "JOIN FETCH eg.gradedBy gb "
      + "WHERE eg.student = :student AND e.isGradesVisible = true "
      + "ORDER BY eg.gradedAt DESC"
  )
  List<EvaluationGrade> findVisibleGradesByStudent(@Param("student") Student student);

  /**
   * Find grades that should be included in calculation for a student and subject.
   *
   * @param student the student
   * @param subjectId the subject ID
   * @param periodId the period ID
   * @return list of grades to include in calculation
   */
  @Query("SELECT eg FROM EvaluationGrade eg JOIN eg.evaluation e WHERE eg.student = :student "
      + "AND e.subject.idSubject = :subjectId "
      + "AND e.bulletinPeriod.idPeriod = :periodId "
      + "AND eg.includeInCalculation = true")
  List<EvaluationGrade> findGradesForCalculation(
      @Param("student") Student student,
      @Param("subjectId") Long subjectId,
      @Param("periodId") Long periodId
  );
}
