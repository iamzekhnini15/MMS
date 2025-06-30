package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Student;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Student repository.
 */
@Repository
public interface StudentRepository extends CrudRepository<Student, Long> {

  List<Student> findByClassEntity_IdClass(Long idClass);
}
