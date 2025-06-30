package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) representing a User.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
  private Long idUser;
  private String firstname;
  private String lastname;
  private String email;
  private String phone;
  private String password;
  private String civility;
  private String role;
  private String registrationDate;
  private AddressDto address;
}

