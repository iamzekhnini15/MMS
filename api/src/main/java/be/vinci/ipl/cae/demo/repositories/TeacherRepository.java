package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Teacher;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface TeacherRepository extends CrudRepository<Teacher, Long> {

  /**
   * Finds a teacher by user ID.
   *
   * @param userId the ID of the user
   * @return an Optional containing the teacher if found
   */
  Optional<Teacher> findByUserIdUser(Long userId);
}
