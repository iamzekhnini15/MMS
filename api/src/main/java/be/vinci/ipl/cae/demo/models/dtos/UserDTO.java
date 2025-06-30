package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
  private Long idUser;
  private String firstname;
  private String lastname;
  private String email;
  private String phone;
  private String password;
  private String civility;
  private String role;
  private String registrationDate;
  private AddressDTO address;
}

