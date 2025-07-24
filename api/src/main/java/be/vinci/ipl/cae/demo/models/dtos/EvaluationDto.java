package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Evaluation;
import java.util.Date;
import lombok.Data;

/**
 * DTO for Evaluation entity.
 */
@Data
public class EvaluationDto {
  private Long idEvaluation;
  private String title;
  private String description;
  private Long subjectId;
  private String subjectName;
  private Long classId;
  private String className;
  private Long teacherId;
  private String teacherName;
  private Long periodId;
  private String periodName;
  private Double maxScore;
  private Date evaluationDate;
  private Boolean isVisible;
  private Boolean isGradesVisible;
  private Evaluation.EvaluationType type;
  private Date createdAt;
}
