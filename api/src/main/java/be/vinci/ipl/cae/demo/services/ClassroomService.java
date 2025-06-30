package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.repositories.ClassroomRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassroomService {

  private final ClassroomRepository classroomRepository;

  public Iterable<Classroom> getAll() {
    return classroomRepository.findAll();
  }

  public void save(Classroom classroom) {
    classroomRepository.save(classroom);
  }

  public void deleteClassroom(Long id) {
    Optional<Classroom> classroom = classroomRepository.findById(id);
    classroomRepository.deleteById(id);
  }

}
