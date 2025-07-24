package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.SubjectCoefficientDto;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.models.entities.SubjectCoefficient;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectCoefficientRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Service handling operations related to subject coefficients.
 */
@Service
@RequiredArgsConstructor
public class SubjectCoefficientService {

  private final SubjectCoefficientRepository coefficientRepository;
  private final SubjectRepository subjectRepository;
  private final ClassesRepository classesRepository;

  /**
   * Get all coefficients for a class.
   *
   * @param classId the class ID
   * @return list of coefficients
   */
  public List<SubjectCoefficient> getCoefficientsByClass(Long classId) {
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    
    return coefficientRepository.findByClassEntityAndIsActiveTrue(classEntity);
  }

  /**
   * Get all coefficients for a subject.
   *
   * @param subjectId the subject ID
   * @return list of coefficients
   */
  public List<SubjectCoefficient> getCoefficientsBySubject(Long subjectId) {
    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    
    return coefficientRepository.findBySubjectAndIsActiveTrue(subject);
  }

  /**
   * Get coefficient for a specific subject and class.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return the coefficient if found
   */
  public Optional<SubjectCoefficient> getCoefficientBySubjectAndClass(
      Long subjectId,
      Long classId
  ) {
    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    
    return coefficientRepository.findBySubjectAndClassEntityAndIsActiveTrue(subject, classEntity);
  }

  /**
   * Create or update a subject coefficient.
   *
   * @param dto the coefficient data
   * @return the created or updated coefficient
   */
  @Transactional
  public SubjectCoefficient saveCoefficient(SubjectCoefficientDto dto) {
    Subject subject = subjectRepository.findById(dto.getSubjectId())
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    ClassEntity classEntity = classesRepository.findById(dto.getClassId())
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));

    // Check if coefficient already exists
    Optional<SubjectCoefficient> existingCoefficient = coefficientRepository
        .findBySubjectAndClassEntityAndIsActiveTrue(subject, classEntity);
    
    SubjectCoefficient coefficient;
    if (existingCoefficient.isPresent()) {
      coefficient = existingCoefficient.get();
    } else {
      coefficient = new SubjectCoefficient();
      coefficient.setSubject(subject);
      coefficient.setClassEntity(classEntity);
    }

    coefficient.setCoefficient(dto.getCoefficient());
    coefficient.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

    return coefficientRepository.save(coefficient);
  }

  /**
   * Create coefficients in bulk for a class.
   *
   * @param classId the class ID
   * @param coefficients list of coefficient data
   * @return list of created coefficients
   */
  @Transactional
  public List<SubjectCoefficient> saveBulkCoefficients(
      Long classId,
      List<SubjectCoefficientDto> coefficients
  ) {
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));

    return coefficients.stream().map(dto -> {
      dto.setClassId(classId); // Ensure class ID is set
      return saveCoefficient(dto);
    }).toList();
  }

  /**
   * Get coefficient value for calculation.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return the coefficient value or 1.0 if not found
   */
  public Double getCoefficientValue(Long subjectId, Long classId) {
    return getCoefficientBySubjectAndClass(subjectId, classId)
      .map(SubjectCoefficient::getCoefficient)
      .orElse(1.0); // Default coefficient
  }

  /**
   * Deactivate a coefficient.
   *
   * @param coefficientId the coefficient ID
   */
  @Transactional
  public void deactivateCoefficient(Long coefficientId) {
    Optional<SubjectCoefficient> optionalCoefficient = coefficientRepository.findById(
        coefficientId
    );
    
    if (optionalCoefficient.isPresent()) {
      SubjectCoefficient coefficient = optionalCoefficient.get();
      coefficient.setIsActive(false);
      coefficientRepository.save(coefficient);
    }
  }

  /**
   * Delete a coefficient.
   *
   * @param coefficientId the coefficient ID
   */
  public void deleteCoefficient(Long coefficientId) {
    coefficientRepository.deleteById(coefficientId);
  }

  /**
   * Get all active coefficients.
   *
   * @return list of all active coefficients
   */
  public List<SubjectCoefficient> getAllActiveCoefficients() {
    return coefficientRepository.findAll().stream()
      .filter(SubjectCoefficient::getIsActive)
      .toList();
  }
}
