package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RegisterRequest DTO.
 */
@Data
@NoArgsConstructor
public class RegisterRequest {

  private String email;
  private String password;
  private String passwordConfirmation;
  private String lastname;
  private String firstname;
  private String phone;
  private String role;
  private String civility;
  private boolean active;
  private AdressRequest address;

}