package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.repositories.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service handling operations related to classrooms.
 */
@Service
@RequiredArgsConstructor
public class ClassroomService {

  private final ClassroomRepository classroomRepository;

  /**
   * Retrieves all classrooms.
   *
   * @return an iterable list of all classrooms
   */
  public Iterable<Classroom> getAll() {
    return classroomRepository.findAll();
  }

  /**
   * Saves a new classroom.
   *
   * @param classroom the classroom to save
   */
  public void save(Classroom classroom) {
    classroomRepository.save(classroom);
  }

  /**
   * Deletes a classroom by its ID.
   *
   * @param id the ID of the classroom to delete
   */
  public void deleteClassroom(Long id) {
    classroomRepository.deleteById(id);
  }
}
