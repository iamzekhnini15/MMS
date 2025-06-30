package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.mappers.StudentMapper;
import be.vinci.ipl.cae.demo.mappers.TeacherMapper;
import be.vinci.ipl.cae.demo.models.dtos.ClassDetailsDTO;
import be.vinci.ipl.cae.demo.models.dtos.ClassEntityDTO;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassesService {

  private final ClassesRepository classesRepository;
  private final TeacherRepository teacherRepository;
  private final StudentRepository studentRepository;

  public Iterable<ClassEntity> getAll() {
    return classesRepository.findAll();
  }

  public void deleteClasses(Long id) {
    classesRepository.deleteById(id);
  }

  public void save(ClassEntityDTO classEntityDTO) {
    ClassEntity classEntity = new ClassEntity();
    classEntity.setName(classEntityDTO.getName());
    classEntity.setLevel(classEntityDTO.getLevel());
    classEntity.setDepartment(classEntityDTO.getDepartment());

    Long teacherId = classEntityDTO.getResponsibleTeacher().getIdTeacher();
    System.out.println(teacherId);
    Teacher teacher = teacherRepository.findById(teacherId)
      .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

    classEntity.setResponsibleTeacher(teacher);

    classesRepository.save(classEntity);
  }

}