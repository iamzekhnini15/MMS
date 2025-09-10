package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service for managing student courses.
 */
@Service
@RequiredArgsConstructor
public class StudentCourseService {

  private final StudentRepository studentRepository;
  private final CourseRepository courseRepository;

  /**
   * Retrieves all courses associated with a specific student ID.
   * The courses are determined based on the student's class level.
   *
   * @param studentId the ID of the student.
   * @return a list of courses associated with the student's class level.
   */
  public List<Course> getCoursesForStudent(Long studentId) {
    Optional<Student> studentOptional = studentRepository.findById(studentId);
    if (studentOptional.isEmpty()) {
      return Collections.emptyList();
    }
    Student s = studentOptional.get();
    if (s.getClassEntity() == null || s.getClassEntity().getLevel() == null) {
      return Collections.emptyList();
    }
    String level = s.getClassEntity().getLevel();
    return courseRepository.findByLevel(level);
  }
}
