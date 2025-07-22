package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.EvaluationGrade;
import lombok.Data;
import java.util.Date;

/**
 * DTO for EvaluationGrade entity.
 */
@Data
public class EvaluationGradeDto {
  private Long idGrade;
  private Long evaluationId;
  private String evaluationTitle;
  private Double maxScore;
  private Long studentId;
  private String studentName;
  private Double score;
  private Boolean includeInCalculation;
  private EvaluationGrade.GradeStatus status;
  private String comment;
  private Date gradedAt;
  private Long gradedById;
  private String gradedByName;
  
  // Computed field for percentage
  private Double percentage;
}
