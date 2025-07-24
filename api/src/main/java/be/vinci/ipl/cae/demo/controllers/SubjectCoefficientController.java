package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.SubjectCoefficientDto;
import be.vinci.ipl.cae.demo.models.entities.SubjectCoefficient;
import be.vinci.ipl.cae.demo.services.SubjectCoefficientService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing subject coefficients.
 */
@RestController
@RequestMapping("/coefficients")
@RequiredArgsConstructor
public class SubjectCoefficientController {

  private final SubjectCoefficientService coefficientService;

  /**
   * Get all coefficients for a class.
   *
   * @param classId the class ID
   * @return list of coefficients
   */
  @GetMapping("/class/{classId}")
  public ResponseEntity<List<SubjectCoefficient>> getCoefficientsByClass(
      @PathVariable Long classId) {
    try {
      List<SubjectCoefficient> coefficients = coefficientService.getCoefficientsByClass(classId);
      return ResponseEntity.ok(coefficients);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get all coefficients for a subject.
   *
   * @param subjectId the subject ID
   * @return list of coefficients
   */
  @GetMapping("/subject/{subjectId}")
  public ResponseEntity<List<SubjectCoefficient>> getCoefficientsBySubject(
      @PathVariable Long subjectId) {
    try {
      List<SubjectCoefficient> coefficients = coefficientService.getCoefficientsBySubject(
          subjectId
      );
      return ResponseEntity.ok(coefficients);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get coefficient for a specific subject and class.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return the coefficient if found
   */
  @GetMapping("/subject/{subjectId}/class/{classId}")
  public ResponseEntity<SubjectCoefficient> getCoefficientBySubjectAndClass(
      @PathVariable Long subjectId, @PathVariable Long classId) {
    try {
      Optional<SubjectCoefficient> coefficient = 
          coefficientService.getCoefficientBySubjectAndClass(subjectId, classId);
      return coefficient.map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get coefficient value for calculation.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return the coefficient value
   */
  @GetMapping("/value/subject/{subjectId}/class/{classId}")
  public ResponseEntity<Double> getCoefficientValue(
      @PathVariable Long subjectId, @PathVariable Long classId) {
    Double coefficientValue = coefficientService.getCoefficientValue(subjectId, classId);
    return ResponseEntity.ok(coefficientValue);
  }

  /**
   * Get all active coefficients.
   *
   * @return list of all active coefficients
   */
  @GetMapping("/all")
  public ResponseEntity<List<SubjectCoefficient>> getAllActiveCoefficients() {
    List<SubjectCoefficient> coefficients = coefficientService.getAllActiveCoefficients();
    return ResponseEntity.ok(coefficients);
  }

  /**
   * Create or update a subject coefficient.
   *
   * @param dto the coefficient data
   * @return the created or updated coefficient
   */
  @PostMapping("/save")
  public ResponseEntity<SubjectCoefficient> saveCoefficient(
      @RequestBody SubjectCoefficientDto dto) {
    try {
      SubjectCoefficient savedCoefficient = coefficientService.saveCoefficient(dto);
      return ResponseEntity.status(HttpStatus.CREATED).body(savedCoefficient);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Save coefficients in bulk for a class.
   *
   * @param classId the class ID
   * @param coefficients list of coefficient data
   * @return list of saved coefficients
   */
  @PostMapping("/bulk-save/class/{classId}")
  public ResponseEntity<List<SubjectCoefficient>> saveBulkCoefficients(
      @PathVariable Long classId,
      @RequestBody List<SubjectCoefficientDto> coefficients
  ) {
    try {
      List<SubjectCoefficient> savedCoefficients = coefficientService.saveBulkCoefficients(
          classId,
          coefficients
      );
      return ResponseEntity.status(HttpStatus.CREATED).body(savedCoefficients);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Deactivate a coefficient.
   *
   * @param coefficientId the coefficient ID
   * @return success message
   */
  @PatchMapping("/{coefficientId}/deactivate")
  public ResponseEntity<String> deactivateCoefficient(@PathVariable Long coefficientId) {
    try {
      coefficientService.deactivateCoefficient(coefficientId);
      return ResponseEntity.ok("Coefficient deactivated successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deactivating coefficient: " + e.getMessage());
    }
  }

  /**
   * Delete a coefficient.
   *
   * @param coefficientId the coefficient ID
   * @return success message
   */
  @DeleteMapping("/{coefficientId}")
  public ResponseEntity<String> deleteCoefficient(@PathVariable Long coefficientId) {
    try {
      coefficientService.deleteCoefficient(coefficientId);
      return ResponseEntity.ok("Coefficient deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deleting coefficient: " + e.getMessage());
    }
  }
}
