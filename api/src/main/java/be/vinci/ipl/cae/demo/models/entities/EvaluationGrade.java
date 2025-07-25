package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a student's grade for an evaluation.
 */
@Entity
@Table(name = "evaluation_grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EvaluationGrade {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idGrade;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idEvaluation", nullable = false)
  private Evaluation evaluation;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idStudent", nullable = false)
  private Student student;

  @Column(nullable = false)
  private Double score; // The student's score (e.g., 15.5 out of 20)

  @Column(nullable = false)
  private Boolean includeInCalculation = true; // Include this grade in average calculation

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private GradeStatus status = GradeStatus.PRESENT;

  @Column(length = 500)
  private String comment; // Optional teacher comment

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date gradedAt = new Date(); // When the grade was entered

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idGradedBy", nullable = false)
  private Teacher gradedBy; // Which teacher entered this grade

  /**
   * Enumeration of grade status.
   */
  public enum GradeStatus {
    PRESENT,      // Student was present and graded
    ABSENT,       // Student was absent
    EXCUSED,      // Student was excused
    LATE_SUBMISSION // Late submission (if applicable)
  }

  // JSON helper methods for frontend
  @JsonProperty("evaluationTitle")
  public String getEvaluationTitle() {
    return evaluation != null ? evaluation.getTitle() : null;
  }

  @JsonProperty("subjectName")
  public String getSubjectName() {
    return evaluation != null && evaluation.getSubject() != null
      ?
      evaluation.getSubject().getName() : null;
  }

  @JsonProperty("maxScore")
  public Double getMaxScore() {
    return evaluation != null ? evaluation.getMaxScore() : null;
  }

  @JsonProperty("evaluationDate")
  public Date getEvaluationDate() {
    return evaluation != null ? evaluation.getEvaluationDate() : null;
  }

  @JsonProperty("periodName")
  public String getPeriodName() {
    return evaluation != null && evaluation.getBulletinPeriod() != null
      ?
      evaluation.getBulletinPeriod().getName() : null;
  }

  @JsonProperty("studentName")
  public String getStudentName() {
    return student != null && student.getUser() != null
      ?
      student.getUser().getFirstname() + " " + student.getUser().getLastname() : null;
  }

  @JsonProperty("gradedByName")
  public String getGradedByName() {
    return gradedBy != null && gradedBy.getUser() != null
      ?
      gradedBy.getUser().getFirstname() + " " + gradedBy.getUser().getLastname() : null;
  }

  /**
   * Get the percentage score of this evaluation grade.
   *
   * @return the percentage score or null if score/evaluation/maxScore is null
   */
  @JsonProperty("percentage")
  public Double getPercentage() {
    if (score != null && evaluation != null && evaluation.getMaxScore() != null) {
      return score / evaluation.getMaxScore() * 100;
    }
    return null;
  }
}
