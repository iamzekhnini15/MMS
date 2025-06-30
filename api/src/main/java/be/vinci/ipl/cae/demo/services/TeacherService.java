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

@Service
@RequiredArgsConstructor
public class TeacherService {

  private final TeacherRepository teacherRepository;
  private final AddressRepository addressRepository;
  private final UserRepository userRepository;
  private final UserService userService;

  @Transactional
  public List<Teacher> getAllTeachers() {
    return (List<Teacher>) teacherRepository.findAll();
  }


  @Transactional
  public void addTeacher(Teacher teacher) {

    Address savedAddress = addressRepository.save(teacher.getUser().getAddress());

    User user = teacher.getUser();

    // Crée un user en mémoire avec email et password hashé (mais pas encore sauvegardé)
    User newUser = userService.createOneUserForTeacher(user.getEmail(), user.getPassword());

    // Assigne les autres infos
    newUser.setAddress(savedAddress);
    newUser.setFirstname(user.getFirstname());
    newUser.setLastname(user.getLastname());
    newUser.setPhone(user.getPhone());
    newUser.setCivility(user.getCivility());
    newUser.setRole(user.getRole());
    newUser.setRegistrationDate(user.getRegistrationDate());
    // etc. selon ce que tu as dans User

    // Sauvegarde une seule fois à la fin
    User savedUser = userRepository.save(newUser);

    teacher.setUser(savedUser);
    teacherRepository.save(teacher);
  }



}
