package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.Data;

/**
 * DTO for bulk grade input by evaluation.
 */
@Data
public class BulkGradeInputDto {
  private Long evaluationId;
  private List<StudentGradeDto> grades;
  
  /**
   * DTO for individual student grade.
   */
  @Data
  public static class StudentGradeDto {
    private Long studentId;
    private Double score;
    private Boolean includeInCalculation = true;
    private String status = "PRESENT"; // PRESENT, ABSENT, EXCUSED, LATE_SUBMISSION
    private String comment;
  }
}
