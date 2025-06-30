package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassDetailsDTO {
  private UUID id;
  private String name;
  private int year;
  private UUID teacher;

  // Version simplifiée des étudiants
  private List<StudentBasicDTO> students;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StudentBasicDTO {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
  }
}
