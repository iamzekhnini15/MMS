package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.File;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for File entities.
 * Provides JPA-based data access methods.
 */
@Repository
public interface FileRepository extends JpaRepository<File, Long> {

  /**
   * Finds all files related to a specific subject.
   *
   * @param subjectId The ID of the subject.
   * @return A list of files associated with the subject.
   */
  List<File> findBySubjectIdSubject(Long subjectId);
}

