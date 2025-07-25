package be.vinci.ipl.cae.demo.utils;

import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.BulletinPeriodRepository;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Utility class for common entity validation operations.
 */
@Component
@RequiredArgsConstructor
public class EntityUtils {

  private final SubjectRepository subjectRepository;
  private final ClassesRepository classesRepository;
  private final BulletinPeriodRepository bulletinPeriodRepository;

  /**
   * Helper method to validate and retrieve a Subject.
   *
   * @param subjectId the subject ID
   * @return the Subject
   * @throws IllegalArgumentException if subject not found
   */
  public Subject validateAndGetSubject(Long subjectId) {
    return subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
  }

  /**
   * Helper method to validate and retrieve a ClassEntity.
   *
   * @param classId the class ID
   * @return the ClassEntity
   * @throws IllegalArgumentException if class not found
   */
  public ClassEntity validateAndGetClass(Long classId) {
    return classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
  }

  /**
   * Helper method to validate and retrieve a BulletinPeriod.
   *
   * @param periodId the period ID
   * @return the BulletinPeriod
   * @throws IllegalArgumentException if period not found
   */
  public BulletinPeriod validateAndGetPeriod(Long periodId) {
    return bulletinPeriodRepository.findById(periodId)
        .orElseThrow(() -> new IllegalArgumentException("Period not found"));
  }
}
