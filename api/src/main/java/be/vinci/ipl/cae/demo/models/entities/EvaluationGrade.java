package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
}
