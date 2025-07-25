package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.BulkGradeInputDto;
import be.vinci.ipl.cae.demo.models.entities.BulletinConfig;
import be.vinci.ipl.cae.demo.models.entities.EvaluationGrade;
import be.vinci.ipl.cae.demo.services.GradeService;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing evaluation grades.
 */
@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {

  private final GradeService gradeService;

  /**
   * Get all grades for an evaluation.
   *
   * @param evaluationId the evaluation ID
   * @return list of grades
   */
  @GetMapping("/evaluation/{evaluationId}")
  public ResponseEntity<List<EvaluationGrade>> getGradesByEvaluation(
      @PathVariable Long evaluationId
  ) {
    try {
      List<EvaluationGrade> grades = gradeService.getGradesByEvaluation(evaluationId);
      return ResponseEntity.ok(grades);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get visible grades for a student.
   *
   * @param studentId the student ID
   * @return list of visible grades
   */
  @GetMapping("/student/{studentId}/visible")
  public ResponseEntity<List<EvaluationGrade>> getVisibleGradesByStudent(
      @PathVariable Long studentId
  ) {
    try {
      List<EvaluationGrade> grades = gradeService.getVisibleGradesByStudent(studentId);
      return ResponseEntity.ok(grades);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get grades for calculation.
   *
   * @param studentId the student ID
   * @param subjectId the subject ID
   * @param periodId the period ID
   * @return list of grades for calculation
   */
  @GetMapping(
      "/calculation/student/{studentId}/subject/{subjectId}/period/{periodId}"
  )
  public ResponseEntity<List<EvaluationGrade>> getGradesForCalculation(
      @PathVariable Long studentId,
      @PathVariable Long subjectId,
      @PathVariable Long periodId
  ) {
    try {
      List<EvaluationGrade> grades = gradeService.getGradesForCalculation(
          studentId,
          subjectId,
          periodId
      );
      return ResponseEntity.ok(grades);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Calculate subject average for a student.
   *
   * @param studentId the student ID
   * @param subjectId the subject ID
   * @param periodId the period ID
   * @param averageType the average calculation type
   * @return the calculated average
   */
  @GetMapping("/average/student/{studentId}/subject/{subjectId}/period/{periodId}")
  public ResponseEntity<Double> calculateSubjectAverage(
      @PathVariable Long studentId, 
      @PathVariable Long subjectId, 
      @PathVariable Long periodId,
      @RequestParam(defaultValue = "ARITHMETIC") String averageType
  ) {
    try {
      BulletinConfig.AverageType type = BulletinConfig.AverageType.valueOf(
          averageType.toUpperCase(Locale.ROOT)
      );
      Double average = gradeService.calculateSubjectAverage(studentId, subjectId, periodId, type);
      return ResponseEntity.ok(average);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Get a grade by ID.
   *
   * @param gradeId the grade ID
   * @return the grade if found
   */
  @GetMapping("/{gradeId}")
  public ResponseEntity<EvaluationGrade> getGradeById(@PathVariable Long gradeId) {
    Optional<EvaluationGrade> grade = gradeService.getGradeById(gradeId);
    return grade.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Save a single grade.
   *
   * @param evaluationId the evaluation ID
   * @param studentId the student ID
   * @param score the score
   * @param teacherId the teacher ID
   * @param includeInCalculation whether to include in calculation
   * @param status the grade status
   * @param comment optional comment
   * @return the saved grade
   */
  @PostMapping("/save")
  public ResponseEntity<EvaluationGrade> saveGrade(
      @RequestParam Long evaluationId,
      @RequestParam Long studentId,
      @RequestParam Double score,
      @RequestParam Long teacherId,
      @RequestParam(defaultValue = "true") Boolean includeInCalculation,
      @RequestParam(defaultValue = "PRESENT") String status,
      @RequestParam(required = false) String comment) {
    try {
      EvaluationGrade savedGrade = gradeService.saveGrade(
          evaluationId, studentId, score, teacherId, includeInCalculation, status, comment);
      return ResponseEntity.status(HttpStatus.CREATED).body(savedGrade);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Save grades in bulk for an evaluation.
   *
   * @param bulkGradeDto the bulk grade data
   * @param teacherId the teacher ID
   * @return list of saved grades
   */
  @PostMapping("/bulk-save")
  public ResponseEntity<List<EvaluationGrade>> saveBulkGrades(
      @RequestBody BulkGradeInputDto bulkGradeDto,
      @RequestParam Long teacherId) {
    try {
      List<EvaluationGrade> savedGrades = gradeService.saveBulkGrades(bulkGradeDto, teacherId);
      return ResponseEntity.status(HttpStatus.CREATED).body(savedGrades);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Delete a grade.
   *
   * @param gradeId the grade ID
   * @return success message
   */
  @DeleteMapping("/{gradeId}")
  public ResponseEntity<String> deleteGrade(@PathVariable Long gradeId) {
    try {
      gradeService.deleteGrade(gradeId);
      return ResponseEntity.ok("Grade deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deleting grade: " + e.getMessage());
    }
  }
}
