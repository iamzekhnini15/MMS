package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.ClassEntityDto;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service handling operations related to class entities.
 */
@Service
@RequiredArgsConstructor
public class ClassesService {

  private final ClassesRepository classesRepository;
  private final TeacherRepository teacherRepository;
  private final StudentRepository studentRepository;

  /**
   * Retrieves all classes.
   *
   * @return an iterable list of all class entities
   */
  public Iterable<ClassEntity> getAll() {
    return classesRepository.findAll();
  }

  /**
   * Deletes a class by its ID.
   *
   * @param id the ID of the class to delete
   */
  public void deleteClasses(Long id) {
    classesRepository.deleteById(id);
  }

  /**
   * Creates and saves a new class based on the provided DTO.
   *
   * @param classEntityDto the class data transfer object containing class details
   */
  public void save(ClassEntityDto classEntityDto) {
    ClassEntity classEntity = new ClassEntity();
    classEntity.setName(classEntityDto.getName());
    classEntity.setLevel(classEntityDto.getLevel());
    classEntity.setDepartment(classEntityDto.getDepartment());

    Long teacherId = classEntityDto.getResponsibleTeacher().getIdTeacher();
    System.out.println(teacherId);
    Teacher teacher = teacherRepository.findById(teacherId)
        .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

    classEntity.setResponsibleTeacher(teacher);

    classesRepository.save(classEntity);
  }
}
