package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object providing detailed information about a class.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassDetailsDto {
  private UUID id;
  private String name;
  private int year;
  private UUID teacher;

  // Version simplifiée des étudiants
  private List<StudentBasicDto> students;

  /**
   * Data Transfer Object representing basic student information.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StudentBasicDto {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
  }
}
