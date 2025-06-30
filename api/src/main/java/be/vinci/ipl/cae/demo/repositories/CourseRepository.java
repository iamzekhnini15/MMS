package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Course;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Course repository.
 */
@Repository
public interface CourseRepository extends CrudRepository<Course, Long> {

  Course findById(long id);
}
