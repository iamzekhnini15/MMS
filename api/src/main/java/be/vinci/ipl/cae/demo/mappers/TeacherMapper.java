package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.AddressDTO;
import be.vinci.ipl.cae.demo.models.dtos.TeacherDTO;
import be.vinci.ipl.cae.demo.models.dtos.UserDTO;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import java.util.Date;

public class TeacherMapper {

  public static Teacher toEntity(TeacherDTO dto) {
    if (dto == null) return null;

    System.out.println(dto);

    UserDTO userDto = dto.getUser();
    AddressDTO addressDto = userDto.getAddress();

    Address address = new Address();
    address.setStreet(addressDto.getStreet());
    address.setNumber(addressDto.getNumber());
    address.setBox(addressDto.getBox());
    address.setPostalCode(addressDto.getPostalCode());
    address.setCommune(addressDto.getCommune());
    address.setCountry(addressDto.getCountry());

    User user = new User();
    user.setEmail(userDto.getEmail());
    user.setPassword(userDto.getPassword());
    user.setLastname(userDto.getLastname());
    user.setFirstname(userDto.getFirstname());
    user.setPhone(userDto.getPhone());
    user.setCivility(userDto.getCivility());
    user.setRegistrationDate(new Date());
    user.setActive(true);
    user.setAddress(address);
    user.setRole(Role.valueOf(userDto.getRole()));

    Teacher teacher = new Teacher();
    teacher.setUser(user);
    teacher.setContractType(dto.getContractType());
    teacher.setIsFullTime(dto.isFullTime());
    teacher.setAvailability(dto.getAvailability());
    teacher.setSpecialities(dto.getSpecialities());

    return teacher;
  }
}

