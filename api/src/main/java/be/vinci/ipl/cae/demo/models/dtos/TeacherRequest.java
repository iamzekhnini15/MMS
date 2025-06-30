package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) for address information in the system. This class is used to represent
 * the data needed to create or update an address.
 */
@Data
@NoArgsConstructor
public class TeacherRequest {

  private UserDto user;
  private String contractType;
  private boolean isFullTime;
  private String availability;
  private String specialties;

}