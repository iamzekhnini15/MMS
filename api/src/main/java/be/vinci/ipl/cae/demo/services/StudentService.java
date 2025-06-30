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

@Service
@RequiredArgsConstructor
public class StudentService {

  private final AddressRepository addressRepository;
  private final UserRepository userRepository;
  private final UserService userService;
  private final StudentRepository studentRepository;

  public List<Student> getStudentsByClassId(Long idClass) {
    return studentRepository.findByClassEntity_IdClass(idClass);
  }


  @Transactional
  public void addStudent(Student student) {

    Address savedAddress = addressRepository.save(student.getUser().getAddress());

    User user = student.getUser();

    User newUser = userService.createOneUserForTeacher(user.getEmail(), user.getPassword());

    newUser.setAddress(savedAddress);
    newUser.setFirstname(user.getFirstname());
    newUser.setLastname(user.getLastname());
    newUser.setPhone(user.getPhone());
    newUser.setCivility(user.getCivility());
    newUser.setRole(user.getRole());
    newUser.setRegistrationDate(user.getRegistrationDate());

    User savedUser = userRepository.save(newUser);

    student.setUser(savedUser);
    studentRepository.save(student);

  }



}
