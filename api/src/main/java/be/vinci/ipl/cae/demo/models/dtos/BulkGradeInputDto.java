package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import java.util.List;

/**
 * DTO for bulk grade input by evaluation.
 */
@Data
public class BulkGradeInputDto {
  private Long evaluationId;
  private List<StudentGradeDto> grades;
  
  @Data
  public static class StudentGradeDto {
    private Long studentId;
    private Double score;
    private Boolean includeInCalculation = true;
    private String status = "PRESENT"; // PRESENT, ABSENT, EXCUSED, LATE_SUBMISSION
    private String comment;
  }
}
