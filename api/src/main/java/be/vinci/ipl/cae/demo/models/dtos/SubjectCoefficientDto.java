package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;

/**
 * DTO for SubjectCoefficient entity.
 */
@Data
public class SubjectCoefficientDto {
  private Long idCoefficient;
  private Long subjectId;
  private String subjectName;
  private Long classId;
  private String className;
  private Double coefficient;
  private Boolean isActive;
}
