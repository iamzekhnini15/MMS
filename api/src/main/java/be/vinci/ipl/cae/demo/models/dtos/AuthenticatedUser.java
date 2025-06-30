package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.User;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthenticatedUser DTO.
 */
@Data
@NoArgsConstructor
public class AuthenticatedUser {

  private User user;
  private String token;
}
