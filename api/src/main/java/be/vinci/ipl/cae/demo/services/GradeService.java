package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.BulkGradeInputDto;
import be.vinci.ipl.cae.demo.models.entities.BulletinConfig;
import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import be.vinci.ipl.cae.demo.models.entities.EvaluationGrade;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.repositories.EvaluationGradeRepository;
import be.vinci.ipl.cae.demo.repositories.EvaluationRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling operations related to evaluation grades.
 */
@Service
@RequiredArgsConstructor
public class GradeService {

  private final EvaluationGradeRepository gradeRepository;
  private final EvaluationRepository evaluationRepository;
  private final StudentRepository studentRepository;
  private final TeacherRepository teacherRepository;

  /**
   * Get all grades for an evaluation.
   *
   * @param evaluationId the evaluation ID
   * @return list of grades
   */
  public List<EvaluationGrade> getGradesByEvaluation(Long evaluationId) {
    Evaluation evaluation = evaluationRepository.findById(evaluationId)
        .orElseThrow(() -> new IllegalArgumentException("Evaluation not found"));
    
    return gradeRepository.findByEvaluation(evaluation);
  }

  /**
   * Get all visible grades for a student.
   *
   * @param studentId the student ID
   * @return list of visible grades
   */
  public List<EvaluationGrade> getVisibleGradesByStudent(Long studentId) {
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    
    return gradeRepository.findVisibleGradesByStudent(student);
  }

  /**
   * Get grades for calculation (subject and period specific).
   *
   * @param studentId the student ID
   * @param subjectId the subject ID
   * @param periodId the period ID
   * @return list of grades to include in calculation
   */
  public List<EvaluationGrade> getGradesForCalculation(
      Long studentId,
      Long subjectId,
      Long periodId
  ) {
    return gradeRepository.findGradesForCalculation(
      studentRepository.findById(studentId).orElseThrow(
         () -> new IllegalArgumentException("Student not found")
      ),
      subjectId,
      periodId
    );
  }

  /**
   * Create or update a single grade.
   *
   * @param evaluationId the evaluation ID
   * @param studentId the student ID
   * @param score the score
   * @param teacherId the teacher ID who is grading
   * @param includeInCalculation whether to include in calculation
   * @param status the grade status
   * @param comment optional comment
   * @return the created or updated grade
   */
  @Transactional
  public EvaluationGrade saveGrade(
      Long evaluationId,
      Long studentId,
      Double score,
      Long teacherId,
      Boolean includeInCalculation,
      String status,
      String comment
  ) {
    
    Evaluation evaluation = evaluationRepository.findById(evaluationId)
        .orElseThrow(() -> new IllegalArgumentException("Evaluation not found"));
    Student student = studentRepository.findById(studentId)
        .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    Teacher teacher = teacherRepository.findById(teacherId)
        .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

    // Get or create grade
    EvaluationGrade grade = getOrCreateGrade(evaluation, student, teacher);

    grade.setScore(score);
    grade.setIncludeInCalculation(includeInCalculation == null || includeInCalculation);
    grade.setStatus(EvaluationGrade.GradeStatus.valueOf(
        status != null ? status.toUpperCase(Locale.ROOT) : "PRESENT"
      )
    );
    grade.setComment(comment);
    grade.setGradedAt(new Date());

    return gradeRepository.save(grade);
  }

  /**
   * Save grades in bulk for an evaluation.
   *
   * @param bulkGradeDto the bulk grade data
   * @param teacherId the teacher ID who is grading
   * @return list of saved grades
   */
  @Transactional
  public List<EvaluationGrade> saveBulkGrades(BulkGradeInputDto bulkGradeDto, Long teacherId) {
    Evaluation evaluation = evaluationRepository.findById(bulkGradeDto.getEvaluationId())
        .orElseThrow(() -> new IllegalArgumentException("Evaluation not found"));
    Teacher teacher = teacherRepository.findById(teacherId)
        .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

    List<EvaluationGrade> savedGrades = new ArrayList<>();

    for (BulkGradeInputDto.StudentGradeDto gradeDto : bulkGradeDto.getGrades()) {
      Student student = studentRepository.findById(gradeDto.getStudentId())
          .orElseThrow(() -> new IllegalArgumentException(
              "Student not found: " + gradeDto.getStudentId()
          ));

      // Get or create grade
      EvaluationGrade grade = getOrCreateGrade(evaluation, student, teacher);

      grade.setScore(gradeDto.getScore());
      grade.setIncludeInCalculation(gradeDto.getIncludeInCalculation());
      grade.setStatus(EvaluationGrade.GradeStatus.valueOf(
          gradeDto.getStatus().toUpperCase(Locale.ROOT)));
      grade.setComment(gradeDto.getComment());
      grade.setGradedAt(new Date());

      savedGrades.add(gradeRepository.save(grade));
    }

    return savedGrades;
  }

  /**
   * Calculate average for a student in a subject for a period.
   *
   * @param studentId the student ID
   * @param subjectId the subject ID
   * @param periodId the period ID
   * @param averageType the type of average to calculate
   * @return the calculated average
   */
  public Double calculateSubjectAverage(Long studentId, Long subjectId, Long periodId, 
                                       BulletinConfig.AverageType averageType) {
    List<EvaluationGrade> grades = getGradesForCalculation(studentId, subjectId, periodId);
    
    if (grades.isEmpty()) {
      return 0.0;
    }

    switch (averageType) {
      case ARITHMETIC:
        return calculateArithmeticAverage(grades);
      case WEIGHTED:
        return calculateWeightedAverage(grades);
      case GEOMETRIC:
        return calculateGeometricAverage(grades);
      case HARMONIC:
        return calculateHarmonicAverage(grades);
      default:
        return calculateArithmeticAverage(grades);
    }
  }

  private Double calculateArithmeticAverage(List<EvaluationGrade> grades) {
    double sum = 0.0;
    int count = 0;
    
    for (EvaluationGrade grade : grades) {
      if (grade.getIncludeInCalculation()) {
        // Convert to percentage (score/maxScore * 20)
        double percentage = grade.getScore() / grade.getEvaluation().getMaxScore() * 20.0;
        sum += percentage;
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0.0;
  }

  private Double calculateWeightedAverage(List<EvaluationGrade> grades) {
    double weightedSum = 0.0;
    double totalWeight = 0.0;
    
    for (EvaluationGrade grade : grades) {
      if (grade.getIncludeInCalculation()) {
        double percentage = grade.getScore() / grade.getEvaluation().getMaxScore() * 20.0;
        double weight = grade.getEvaluation().getMaxScore(); // Use max score as weight
        weightedSum += percentage * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.0;
  }

  private Double calculateGeometricAverage(List<EvaluationGrade> grades) {
    double product = 1.0;
    int count = 0;
    
    for (EvaluationGrade grade : grades) {
      if (grade.getIncludeInCalculation()) {
        double percentage = grade.getScore() / grade.getEvaluation().getMaxScore() * 20.0;
        if (percentage > 0) { // Avoid 0 in geometric mean
          product *= percentage;
          count++;
        }
      }
    }
    
    return count > 0 ? Math.pow(product, 1.0 / count) : 0.0;
  }

  private Double calculateHarmonicAverage(List<EvaluationGrade> grades) {
    double reciprocalSum = 0.0;
    int count = 0;
    
    for (EvaluationGrade grade : grades) {
      if (grade.getIncludeInCalculation()) {
        double percentage = grade.getScore() / grade.getEvaluation().getMaxScore() * 20.0;
        if (percentage > 0) { // Avoid division by 0
          reciprocalSum += 1.0 / percentage;
          count++;
        }
      }
    }
    
    return count > 0 ? count / reciprocalSum : 0.0;
  }

  /**
   * Delete a grade.
   *
   * @param gradeId the grade ID
   */
  public void deleteGrade(Long gradeId) {
    gradeRepository.deleteById(gradeId);
  }

  /**
   * Get a grade by ID.
   *
   * @param gradeId the grade ID
   * @return the grade if found
   */
  public Optional<EvaluationGrade> getGradeById(Long gradeId) {
    return gradeRepository.findById(gradeId);
  }

  /**
   * Helper method to create or update an evaluation grade.
   *
   * @param evaluation the evaluation
   * @param student the student
   * @param teacher the teacher (optional, used only for new grades)
   * @return the existing or new evaluation grade
   */
  private EvaluationGrade getOrCreateGrade(Evaluation evaluation, Student student, Teacher teacher) {
    Optional<EvaluationGrade> existingGrade = gradeRepository.findByEvaluationAndStudent(
        evaluation,
        student
    );
    
    if (existingGrade.isPresent()) {
      return existingGrade.get();
    } else {
      EvaluationGrade grade = new EvaluationGrade();
      grade.setEvaluation(evaluation);
      grade.setStudent(student);
      if (teacher != null) {
        grade.setGradedBy(teacher);
      }
      return grade;
    }
  }
}
