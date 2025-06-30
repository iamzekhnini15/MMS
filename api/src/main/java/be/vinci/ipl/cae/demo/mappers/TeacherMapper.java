package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.TeacherDto;
import be.vinci.ipl.cae.demo.models.dtos.UserDto;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.User;


/**
 * Mapper utilitaire pour convertir un {@link TeacherDto} en entité {@link Teacher}.
 */
public final class TeacherMapper {


  private TeacherMapper() {}

  /**
   * Convertit un {@link TeacherDto} en entité {@link Teacher}.
   *
   * @param dto le DTO à convertir
   * @return l'entité correspondante ou {@code null} si le DTO est {@code null}
   */
  public static Teacher toEntity(TeacherDto dto) {
    if (dto == null) {
      return null;
    }

    System.out.println(dto);

    UserDto userDto = dto.getUser();
    User user = UserMapper.mapToUser(userDto);
    Address address = AddressMapper.mapToAddress(userDto.getAddress());
    user.setAddress(address);

    Teacher teacher = new Teacher();
    teacher.setUser(user);
    teacher.setContractType(dto.getContractType());
    teacher.setIsFullTime(dto.isFullTime());
    teacher.setAvailability(dto.getAvailability());
    teacher.setSpecialities(dto.getSpecialities());

    return teacher;
  }
}

