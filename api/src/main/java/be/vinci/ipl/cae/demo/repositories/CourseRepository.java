package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Course;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Course entities.
 * Provides CRUD operations and a method to find a course by its ID.
 */
@Repository
public interface CourseRepository extends CrudRepository<Course, Long> {

  /**
   * Finds a course by its ID.
   *
   * @param id The ID of the course.
   * @return The found Course entity.
   */
  Course findById(long id);

  /**
   * Finds all courses with the specified level.
   *
   * @param level The level of the courses to find.
   * @return A list of Course entities with the given level.
   */
  java.util.List<Course> findByLevel(String level);
}
