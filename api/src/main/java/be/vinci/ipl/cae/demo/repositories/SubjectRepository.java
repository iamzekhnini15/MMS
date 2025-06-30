package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Subject;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Subject entities.
 * Provides CRUD operations and a custom finder to retrieve subjects by course ID.
 */
@Repository
public interface SubjectRepository extends CrudRepository<Subject, Long> {

  /**
   * Finds the list of subjects associated with a given course ID.
   *
   * @param idCourse the ID of the course
   * @return the list of subjects linked to the course
   */
  List<Subject> findByCourseIdCourse(Long idCourse);
}
