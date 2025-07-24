package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.models.entities.SubjectCoefficient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for SubjectCoefficient entities.
 */
@Repository
public interface SubjectCoefficientRepository extends JpaRepository<SubjectCoefficient, Long> {

  /**
   * Find coefficient by subject and class.
   *
   * @param subject the subject
   * @param classEntity the class
   * @return the coefficient if found
   */
  Optional<SubjectCoefficient> findBySubjectAndClassEntityAndIsActiveTrue(
      Subject subject,
      ClassEntity classEntity
  );

  /**
   * Find all coefficients for a class.
   *
   * @param classEntity the class
   * @return list of coefficients
   */
  List<SubjectCoefficient> findByClassEntityAndIsActiveTrue(ClassEntity classEntity);

  /**
   * Find all coefficients for a subject.
   *
   * @param subject the subject
   * @return list of coefficients
   */
  List<SubjectCoefficient> findBySubjectAndIsActiveTrue(Subject subject);
}
