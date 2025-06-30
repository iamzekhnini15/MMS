package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

  private final CourseRepository courseRepository;

  public Iterable<Course> getAll() {
    return courseRepository.findAll();
  }

  public void save(Course course) {
    courseRepository.save(course);
  }

  public void deleteCourse(Long id) {
    Optional<Course> course = courseRepository.findById(id);
    courseRepository.deleteById(id);
  }

}
