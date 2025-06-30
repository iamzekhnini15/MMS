package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.SubjectDto;
import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service class to handle business logic related to Subjects.
 * Provides methods to retrieve all subjects, get subjects by course ID,
 * and create new subjects.
 */
@Service
@RequiredArgsConstructor
public class SubjectService {

  private final SubjectRepository subjectRepository;
  private final CourseRepository courseRepository;

  /**
   * Retrieves all subjects from the repository.
   *
   * @return all subjects
   */
  public Iterable<Subject> getAll() {
    return subjectRepository.findAll();
  }

  /**
   * Retrieves a list of subjects associated with a specific course ID.
   *
   * @param idCourse the ID of the course
   * @return the list of subjects linked to the course
   */
  public List<Subject> getSubjectByCourseId(Long idCourse) {
    return subjectRepository.findByCourseIdCourse(idCourse);
  }

  /**
   * Creates a new subject based on the provided SubjectDto.
   * Throws a ResponseStatusException if the course is not found.
   *
   * @param dto the SubjectDto containing data for the new subject
   * @return the created SubjectDto
   */
  public SubjectDto createSubject(SubjectDto dto) {
    Course course = courseRepository.findById(dto.getIdCourse())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

    Subject subject = new Subject();
    subject.setName(dto.getName());
    subject.setDescription(dto.getDescription());
    subject.setCoefficient(dto.getCoefficient());
    subject.setCourse(course);

    Subject savedSubject = subjectRepository.save(subject);
    return mapToDto(savedSubject);
  }

  /**
   * Maps a Subject entity to a SubjectDto.
   *
   * @param subject the Subject entity to map
   * @return the mapped SubjectDto
   */
  private SubjectDto mapToDto(Subject subject) {
    return new SubjectDto(
      subject.getName(),
      subject.getDescription(),
      subject.getCoefficient(),
      subject.getCourse().getIdCourse()
    );
  }
}
