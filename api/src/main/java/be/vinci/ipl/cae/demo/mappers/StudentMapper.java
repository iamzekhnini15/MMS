package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.AddressDto;
import be.vinci.ipl.cae.demo.models.dtos.StudentDto;
import be.vinci.ipl.cae.demo.models.dtos.UserDto;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.User;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Mapper utilitaire pour convertir entre les entités {@link Student} et les DTO
 * {@link StudentDto}.
 */
public final class StudentMapper {

  private StudentMapper() {
    // Empêche l'instanciation
  }


  /**
   * Convertit un {@link StudentDto} en entité {@link Student}.
   *
   * @param dto le DTO à convertir
   * @return l'entité correspondante ou {@code null} si le DTO est {@code null}
   */
  public static Student toEntity(StudentDto dto) {
    if (dto == null) {
      return null;
    }

    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    Date dob = null;
    try {
      dob = dateFormat.parse(dto.getDateOfBirth());
    } catch (ParseException e) {
      e.printStackTrace();
    }


    UserDto userDto = dto.getUser();
    User user = UserMapper.mapToUser(userDto);
    Address address = AddressMapper.mapToAddress(userDto.getAddress());
    user.setAddress(address);


    Student student = new Student();
    student.setUser(user);
    student.setDateOfBirth(dob);

    if (dto.getClassId() != null) {
      ClassEntity classEntity = new ClassEntity();
      classEntity.setIdClass(dto.getClassId());
      student.setClassEntity(classEntity);
    }

    return student;
  }

  /**
   * Convertit une entité {@link Student} en {@link StudentDto}.
   *
   * @param student l'entité à convertir
   * @return le DTO correspondant ou {@code null} si l'entité est {@code null}
   */
  public static StudentDto toDto(Student student) {
    if (student == null) {
      return null;
    }


    User user = student.getUser();
    UserDto userDto = new UserDto();
    userDto.setIdUser(user.getIdUser());
    userDto.setEmail(user.getEmail());
    userDto.setFirstname(user.getFirstname());
    userDto.setLastname(user.getLastname());
    userDto.setPhone(user.getPhone());
    userDto.setCivility(user.getCivility());
    userDto.setRole(user.getRole().name());
    userDto.setRegistrationDate(user.getRegistrationDate().toString());

    if (user.getAddress() != null) {
      Address address = user.getAddress();
      AddressDto addressDto = new AddressDto();
      addressDto.setStreet(address.getStreet());
      addressDto.setNumber(address.getNumber());
      addressDto.setBox(address.getBox());
      addressDto.setPostalCode(address.getPostalCode());
      addressDto.setCommune(address.getCommune());
      addressDto.setCountry(address.getCountry());
      userDto.setAddress(addressDto);
    }

    StudentDto dto = new StudentDto();
    dto.setUser(userDto);

    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    if (student.getDateOfBirth() != null) {
      dto.setDateOfBirth(dateFormat.format(student.getDateOfBirth()));
    }

    if (student.getClassEntity() != null) {
      dto.setClassId(student.getClassEntity().getIdClass());
    }

    return dto;
  }
}