package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service handling operations related to courses.
 */
@Service
@RequiredArgsConstructor
public class CourseService {

  private final CourseRepository courseRepository;

  /**
   * Retrieves all courses.
   *
   * @return an iterable list of all courses
   */
  public Iterable<Course> getAll() {
    return courseRepository.findAll();
  }

  /**
   * Saves a new course.
   *
   * @param course the course to save
   */
  public void save(Course course) {
    courseRepository.save(course);
  }

  /**
   * Deletes a course by its ID.
   *
   * @param id the ID of the course to delete
   */
  public void deleteCourse(Long id) {
    courseRepository.deleteById(id);
  }
}
