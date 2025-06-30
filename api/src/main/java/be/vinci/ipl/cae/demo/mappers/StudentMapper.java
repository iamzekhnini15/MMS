package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.StudentDTO;
import be.vinci.ipl.cae.demo.models.dtos.UserDTO;
import be.vinci.ipl.cae.demo.models.dtos.AddressDTO;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.User.Role;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class StudentMapper {

  private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

  public static Student toEntity(StudentDTO dto) {
    if (dto == null) return null;

    // Convertir UserDTO -> User
    UserDTO userDto = dto.getUser();
    User user = new User();
    user.setEmail(userDto.getEmail());
    user.setPassword(userDto.getPassword());
    user.setLastname(userDto.getLastname());
    user.setFirstname(userDto.getFirstname());
    user.setPhone(userDto.getPhone());
    user.setCivility(userDto.getCivility());
    user.setRegistrationDate(new Date());
    user.setActive(true);
    user.setRole(Role.valueOf(userDto.getRole()));

    // Convertir AddressDTO -> Address
    if (userDto.getAddress() != null) {
      AddressDTO addressDto = userDto.getAddress();
      Address address = new Address();
      address.setStreet(addressDto.getStreet());
      address.setNumber(addressDto.getNumber());
      address.setBox(addressDto.getBox());
      address.setPostalCode(addressDto.getPostalCode());
      address.setCommune(addressDto.getCommune());
      address.setCountry(addressDto.getCountry());
      user.setAddress(address);
    }

    // Convertir date de naissance
    Date dob = null;
    try {
      dob = dateFormat.parse(dto.getDateOfBirth());
    } catch (ParseException e) {
      e.printStackTrace();
    }

    // Créer l'entité Student
    Student student = new Student();
    student.setUser(user);
    student.setDateOfBirth(dob);

    // Créer la ClassEntity avec juste l'ID (comme dans le nouveau DTO)
    if (dto.getClassId() != null) {
      ClassEntity classEntity = new ClassEntity();
      classEntity.setIdClass(dto.getClassId());
      student.setClassEntity(classEntity);
    }

    return student;
  }

  // Ajout d'une méthode pour convertir Entity -> DTO
  public static StudentDTO toDto(Student student) {
    if (student == null) return null;

    StudentDTO dto = new StudentDTO();

    // Convertir User -> UserDTO
    User user = student.getUser();
    UserDTO userDto = new UserDTO();
    userDto.setIdUser(user.getIdUser());
    userDto.setEmail(user.getEmail());
    userDto.setFirstname(user.getFirstname());
    userDto.setLastname(user.getLastname());
    userDto.setPhone(user.getPhone());
    userDto.setCivility(user.getCivility());
    userDto.setRole(user.getRole().name());
    userDto.setRegistrationDate(user.getRegistrationDate().toString());

    // Convertir Address -> AddressDTO
    if (user.getAddress() != null) {
      Address address = user.getAddress();
      AddressDTO addressDto = new AddressDTO();
      addressDto.setStreet(address.getStreet());
      addressDto.setNumber(address.getNumber());
      addressDto.setBox(address.getBox());
      addressDto.setPostalCode(address.getPostalCode());
      addressDto.setCommune(address.getCommune());
      addressDto.setCountry(address.getCountry());
      userDto.setAddress(addressDto);
    }

    dto.setUser(userDto);

    // Convertir date de naissance
    if (student.getDateOfBirth() != null) {
      dto.setDateOfBirth(dateFormat.format(student.getDateOfBirth()));
    }

    // Ajouter l'ID de la classe
    if (student.getClassEntity() != null) {
      dto.setClassId(student.getClassEntity().getIdClass());
    }

    return dto;
  }
}