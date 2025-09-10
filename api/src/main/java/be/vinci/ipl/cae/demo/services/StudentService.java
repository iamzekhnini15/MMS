package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service class for managing student-related operations.
 */
@Service
@RequiredArgsConstructor
public class StudentService {

  private final AddressRepository addressRepository;
  private final UserRepository userRepository;
  private final UserService userService;
  private final StudentRepository studentRepository;

  /**
   * Retrieves all students belonging to the class with the given ID.
   *
   * @param idClass the ID of the class.
   * @return a list of students in the specified class.
   */
  public List<Student> getStudentsByClassId(Long idClass) {
    return studentRepository.findByClassEntityIdClass(idClass);
  }

  /**
   * Retrieves a student by ID.
   *
   * @param id the ID of the student.
   * @return the student entity.
   */
  public Student getStudentById(Long id) {
    return studentRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Student not found: " + id));
  }

  /**
   * Adds a new student to the system.
   * The method saves the student's address, creates a user, associates the user to the student,
   * and saves the student in the database.
   *
   * @param student the student entity to add.
   */
  @Transactional
  public void addStudent(Student student) {

    Address savedAddress = addressRepository.save(student.getUser().getAddress());

    User savedUser = userService.createUserWithAddress(student.getUser(), savedAddress);

    student.setUser(savedUser);
    studentRepository.save(student);
  }

}

