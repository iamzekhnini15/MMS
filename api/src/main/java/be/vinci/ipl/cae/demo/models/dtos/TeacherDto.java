package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) representing a Teacher.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDto {
  private Long idTeacher;
  private String specialities;
  private String contractType;
  private boolean fullTime;
  private String availability;
  private UserDto user;
}


