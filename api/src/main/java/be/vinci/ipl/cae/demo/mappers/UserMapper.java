package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.UserDto;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import java.util.Date;

/**
 * Utility class for mapping {@link UserDto} objects to {@link User} entities.
 * This class cannot be instantiated.
 */
public final class UserMapper {

  // Private constructor to prevent instantiation
  private UserMapper() {}

  /**
   * Maps a {@link UserDto} to a {@link User} entity.
   * The registration date is set to the current date
   * and the user is set as active by default.
   *
   * @param userDto the {@link UserDto} to map
   * @return the mapped {@link User} entity
   */
  public static User mapToUser(UserDto userDto) {
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
    return user;
  }
}
