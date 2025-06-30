package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDTO {
  private Long idTeacher;
  private String specialities;
  private String contractType;
  private boolean fullTime;
  private String availability;
  private UserDTO user;
}


