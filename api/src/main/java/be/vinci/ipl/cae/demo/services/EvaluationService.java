package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.EvaluationDto;
import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.repositories.BulletinPeriodRepository;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.EvaluationRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling operations related to evaluations.
 */
@Service
@RequiredArgsConstructor
public class EvaluationService {

  private final EvaluationRepository evaluationRepository;
  private final SubjectRepository subjectRepository;
  private final ClassesRepository classesRepository;
  private final TeacherRepository teacherRepository;
  private final BulletinPeriodRepository bulletinPeriodRepository;

  /**
   * Get all evaluations for a teacher.
   *
   * @param teacherId the teacher ID
   * @return list of evaluations
   */
  public List<Evaluation> getEvaluationsByTeacher(Long teacherId) {
    return teacherRepository.findById(teacherId)
      .map(evaluationRepository::findByTeacher)
      .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
  }

  /**
   * Get evaluations by subject and class.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @return list of evaluations
   */
  public List<Evaluation> getEvaluationsBySubjectAndClass(Long subjectId, Long classId) {
    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    
    return evaluationRepository.findBySubjectAndClassEntity(subject, classEntity);
  }

  /**
   * Get evaluations by subject, class and period.
   *
   * @param subjectId the subject ID
   * @param classId the class ID
   * @param periodId the period ID
   * @return list of evaluations
   */
  public List<Evaluation> getEvaluationsBySubjectClassAndPeriod(
      Long subjectId,
      Long classId,
      Long periodId
  ) {
    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    BulletinPeriod period = bulletinPeriodRepository.findById(periodId)
        .orElseThrow(() -> new IllegalArgumentException("Period not found"));
    
    return evaluationRepository.findBySubjectAndClassEntityAndBulletinPeriod(
        subject,
        classEntity,
        period
    );
  }

  /**
   * Create a new evaluation.
   *
   * @param dto the evaluation data
   * @return the created evaluation
   */
  @Transactional
  public Evaluation createEvaluation(EvaluationDto dto) {
    Subject subject = subjectRepository.findById(dto.getSubjectId())
        .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
    ClassEntity classEntity = classesRepository.findById(dto.getClassId())
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    Teacher teacher = teacherRepository.findById(dto.getTeacherId())
        .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
    BulletinPeriod period = bulletinPeriodRepository.findById(dto.getPeriodId())
        .orElseThrow(() -> new IllegalArgumentException("Period not found"));

    Evaluation evaluation = new Evaluation();
    evaluation.setTitle(dto.getTitle());
    evaluation.setDescription(dto.getDescription());
    evaluation.setSubject(subject);
    evaluation.setClassEntity(classEntity);
    evaluation.setTeacher(teacher);
    evaluation.setBulletinPeriod(period);
    evaluation.setMaxScore(dto.getMaxScore());
    evaluation.setEvaluationDate(dto.getEvaluationDate());
    evaluation.setIsVisible(dto.getIsVisible() != null ? dto.getIsVisible() : false);
    evaluation.setIsGradesVisible(dto.getIsGradesVisible() != null
        ? dto.getIsGradesVisible() : false);
    evaluation.setType(dto.getType() != null
        ? dto.getType() : Evaluation.EvaluationType.INTERROGATION);
    evaluation.setCreatedAt(new Date());

    return evaluationRepository.save(evaluation);
  }

  /**
   * Update an evaluation.
   *
   * @param id the evaluation ID
   * @param dto the updated evaluation data
   * @return the updated evaluation
   */
  @Transactional
  public Optional<Evaluation> updateEvaluation(Long id, EvaluationDto dto) {
    Optional<Evaluation> optionalEvaluation = evaluationRepository.findById(id);
    
    if (optionalEvaluation.isPresent()) {
      Evaluation evaluation = optionalEvaluation.get();
      evaluation.setTitle(dto.getTitle());
      evaluation.setDescription(dto.getDescription());
      evaluation.setMaxScore(dto.getMaxScore());
      evaluation.setEvaluationDate(dto.getEvaluationDate());
      evaluation.setIsVisible(dto.getIsVisible());
      evaluation.setIsGradesVisible(dto.getIsGradesVisible());
      evaluation.setType(dto.getType());
      
      return Optional.of(evaluationRepository.save(evaluation));
    }
    
    return Optional.empty();
  }

  /**
   * Toggle evaluation visibility.
   *
   * @param id the evaluation ID
   * @return the updated evaluation
   */
  @Transactional
  public Optional<Evaluation> toggleEvaluationVisibility(Long id) {
    Optional<Evaluation> optionalEvaluation = evaluationRepository.findById(id);
    
    if (optionalEvaluation.isPresent()) {
      Evaluation evaluation = optionalEvaluation.get();
      evaluation.setIsVisible(!evaluation.getIsVisible());
      return Optional.of(evaluationRepository.save(evaluation));
    }
    
    return Optional.empty();
  }

  /**
   * Toggle grades visibility.
   *
   * @param id the evaluation ID
   * @return the updated evaluation
   */
  @Transactional
  public Optional<Evaluation> toggleGradesVisibility(Long id) {
    Optional<Evaluation> optionalEvaluation = evaluationRepository.findById(id);
    
    if (optionalEvaluation.isPresent()) {
      Evaluation evaluation = optionalEvaluation.get();
      evaluation.setIsGradesVisible(!evaluation.getIsGradesVisible());
      return Optional.of(evaluationRepository.save(evaluation));
    }
    
    return Optional.empty();
  }

  /**
   * Delete an evaluation.
   *
   * @param id the evaluation ID
   */
  public void deleteEvaluation(Long id) {
    evaluationRepository.deleteById(id);
  }

  /**
   * Get an evaluation by ID.
   *
   * @param id the evaluation ID
   * @return the evaluation if found
   */
  public Optional<Evaluation> getEvaluationById(Long id) {
    return evaluationRepository.findById(id);
  }

  /**
   * Get visible evaluations for students by class and period.
   *
   * @param classId the class ID
   * @param periodId the period ID
   * @return list of visible evaluations
   */
  public List<Evaluation> getVisibleEvaluationsForStudents(Long classId, Long periodId) {
    ClassEntity classEntity = classesRepository.findById(classId)
        .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    BulletinPeriod period = bulletinPeriodRepository.findById(periodId)
        .orElseThrow(() -> new IllegalArgumentException("Period not found"));
    
    return evaluationRepository.findVisibleEvaluationsByClassAndPeriod(classEntity, period);
  }
}
