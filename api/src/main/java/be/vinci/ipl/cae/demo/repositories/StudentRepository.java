package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Student repository.
 */
@Repository
public interface StudentRepository extends CrudRepository<Student, Long> {

  /**
   * Finds all students associated with a specific class ID.
   *
   * @param idClass the ID of the class to filter students by
   * @return a list of students belonging to the specified class
   */
  List<Student> findByClassEntityIdClass(Long idClass);

  /**
   * Finds a student by user ID.
   *
   * @param userId the ID of the user
   * @return an Optional containing the student if found
   */
  Optional<Student> findByUserIdUser(Long userId);
}
