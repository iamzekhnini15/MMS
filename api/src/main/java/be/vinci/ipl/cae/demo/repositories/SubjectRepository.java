package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Subject repository.
 */
@Repository
public interface SubjectRepository extends CrudRepository<Subject, Long> {

  List<Subject> findByCourseIdCourse(Long idCourse);
}
