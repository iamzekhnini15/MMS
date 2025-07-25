package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.EvaluationDto;
import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import be.vinci.ipl.cae.demo.services.EvaluationService;
import be.vinci.ipl.cae.demo.utils.ControllerUtils;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/**
 * REST controller for managing evaluations.
 */
@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

  private final EvaluationService evaluationService;

  /**
   * Get evaluations by teacher.
   *
   * @param teacherId the teacher ID
   * @return list of evaluations
   */
  @GetMapping("/teacher/{teacherId}")
  public ResponseEntity<List<Evaluation>> getEvaluationsByTeacher(@PathVariable Long teacherId) {
    try {
      List<Evaluation> evaluations = evaluationService.getEvaluationsByTeacher(teacherId);
      return ResponseEntity.ok(evaluations);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get evaluations by subject and class.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return list of evaluations
   */
  @GetMapping("/subject/{subjectId}/class/{classId}")
  public ResponseEntity<List<Evaluation>> getEvaluationsBySubjectAndClass(
      @PathVariable Long subjectId, @PathVariable Long classId) {
    try {
      List<Evaluation> evaluations = evaluationService.getEvaluationsBySubjectAndClass(
          subjectId, classId
      );
      return ResponseEntity.ok(evaluations);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get evaluations by subject, class and period.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @param periodId the period ID
   * @return list of evaluations
   */
  @GetMapping("/subject/{subjectId}/class/{classId}/period/{periodId}")
  public ResponseEntity<List<Evaluation>> getEvaluationsBySubjectClassAndPeriod(
      @PathVariable Long subjectId,
      @PathVariable Long classId,
      @PathVariable Long periodId) {
    try {
      List<Evaluation> evaluations = evaluationService.getEvaluationsBySubjectClassAndPeriod(
          subjectId, classId, periodId
      );
      return ResponseEntity.ok(evaluations);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get visible evaluations for students.
   *
   * @param classId the class ID
   * @param periodId the period ID
   * @return list of visible evaluations
   */
  @GetMapping("/visible/class/{classId}/period/{periodId}")
  public ResponseEntity<List<Evaluation>> getVisibleEvaluationsForStudents(
      @PathVariable Long classId,
      @PathVariable Long periodId) {
    try {
      List<Evaluation> evaluations = evaluationService.getVisibleEvaluationsForStudents(
          classId, periodId
      );
      return ResponseEntity.ok(evaluations);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get an evaluation by ID.
   *
   * @param id the evaluation ID
   * @return the evaluation if found
   */
  @GetMapping("/{id}")
  public ResponseEntity<Evaluation> getEvaluationById(@PathVariable Long id) {
    Optional<Evaluation> evaluation = evaluationService.getEvaluationById(id);
    return evaluation.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Create a new evaluation.
   *
   * @param dto the evaluation data
   * @return the created evaluation
   */
  @PostMapping("/create")
  public ResponseEntity<Evaluation> createEvaluation(@RequestBody EvaluationDto dto) {
    try {
      Evaluation createdEvaluation = evaluationService.createEvaluation(dto);
      return ResponseEntity.status(HttpStatus.CREATED).body(createdEvaluation);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Update an evaluation.
   *
   * @param id the evaluation ID
   * @param dto the updated evaluation data
   * @return the updated evaluation
   */
  @PutMapping("/{id}")
  public ResponseEntity<Evaluation> updateEvaluation(
      @PathVariable Long id,
      @RequestBody EvaluationDto dto) {
    return ControllerUtils.handleUpdateOperation(() -> 
        evaluationService.updateEvaluation(id, dto));
  }

  /**
   * Toggle evaluation visibility.
   *
   * @param id the evaluation ID
   * @return the updated evaluation
   */
  @PatchMapping("/{id}/toggle-visibility")
  public ResponseEntity<Evaluation> toggleEvaluationVisibility(@PathVariable Long id) {
    Optional<Evaluation> updatedEvaluation = evaluationService.toggleEvaluationVisibility(id);
    return updatedEvaluation.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Toggle grades visibility.
   *
   * @param id the evaluation ID
   * @return the updated evaluation
   */
  @PatchMapping("/{id}/toggle-grades-visibility")
  public ResponseEntity<Evaluation> toggleGradesVisibility(@PathVariable Long id) {
    Optional<Evaluation> updatedEvaluation = evaluationService.toggleGradesVisibility(id);
    return updatedEvaluation.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Delete an evaluation.
   *
   * @param id the evaluation ID
   * @return success message
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteEvaluation(@PathVariable Long id) {
    try {
      evaluationService.deleteEvaluation(id);
      return ResponseEntity.ok("Evaluation deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deleting evaluation: " + e.getMessage());
    }
  }
}
