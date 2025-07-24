package be.vinci.ipl.cae.demo.models.dtos;

import java.util.Date;
import java.util.List;
import lombok.Data;

/**
 * DTO for student bulletin.
 */
@Data
public class StudentBulletinDto {
  private Long idBulletin;
  private Long studentId;
  private String studentName;
  private String className;
  private String periodName;
  private String academicYear;
  private Double generalAverage;
  private Integer classRank;
  private Integer totalStudents;
  private Double classAverage;
  private String generalComment;
  private String pdfFilePath;
  private Boolean isVisible;
  private Date generatedAt;
  private List<SubjectGradeDto> subjectGrades;
  
  /**
   * DTO for subject grade details.
   */
  @Data
  public static class SubjectGradeDto {
    private String subjectName;
    private Double average;
    private Double coefficient;
    private Double weightedAverage; // average * coefficient
    private List<EvaluationGradeDto> evaluationGrades;
  }
}
