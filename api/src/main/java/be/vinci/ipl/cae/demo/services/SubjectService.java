package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.SubjectDTO;
import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SubjectService {

  private final SubjectRepository subjectRepository;
  private final CourseRepository courseRepository;


  public Iterable<Subject> getAll() {
    return subjectRepository.findAll();
  }

  public List<Subject> getSubjectByCourseId(Long idCourse) {
    return subjectRepository.findByCourseIdCourse(idCourse);
  }

  public SubjectDTO createSubject(SubjectDTO dto) {
    Course course = courseRepository.findById(dto.getIdCourse())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

    Subject subject = new Subject();
    subject.setName(dto.getName());
    subject.setDescription(dto.getDescription());
    subject.setCoefficient(dto.getCoefficient());
    subject.setCourse(course);

    Subject savedSubject = subjectRepository.save(subject);
    return mapToDTO(savedSubject);
  }

  private SubjectDTO mapToDTO(Subject subject) {
    return new SubjectDTO(
      subject.getName(),
      subject.getDescription(),
      subject.getCoefficient(),
      subject.getCourse().getIdCourse()
    );
  }
}