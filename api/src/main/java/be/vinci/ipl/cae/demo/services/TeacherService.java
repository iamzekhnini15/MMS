package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service class to manage teacher-related operations,
 * including retrieval of all teachers and adding new teachers.
 */
@Service
@RequiredArgsConstructor
public class TeacherService {

  private final TeacherRepository teacherRepository;
  private final AddressRepository addressRepository;
  private final UserRepository userRepository;
  private final UserService userService;

  /**
   * Retrieves all teachers from the repository.
   * Transactional to ensure data consistency.
   *
   * @return a list of all teachers
   */
  @Transactional
  public List<Teacher> getAllTeachers() {
    return (List<Teacher>) teacherRepository.findAll();
  }

  /**
   * Adds a new teacher along with associated user and address.
   * Handles saving of address, user with hashed password,
   * and finally the teacher entity.
   * Transactional to ensure atomic operation.
   *
   * @param teacher the teacher entity to add
   */
  @Transactional
  public void addTeacher(Teacher teacher) {

    Address savedAddress = addressRepository.save(teacher.getUser().getAddress());

    User savedUser = userService.createUserWithAddress(teacher.getUser(), savedAddress);
  
    teacher.setUser(savedUser);
    teacherRepository.save(teacher);
  }

}
