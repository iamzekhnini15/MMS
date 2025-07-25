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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entity representing an evaluation/test for a subject.
 */
@Entity
@Table(name = "evaluations")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Evaluation extends SubjectClassBaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idEvaluation;

  @Column(nullable = false)
  private String title; // e.g., "Interrogation 1", "Examen de mi-parcours"

  @Column(length = 1000)
  private String description; // Optional description of the evaluation

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idPeriod", nullable = false)
  private BulletinPeriod bulletinPeriod;

  @Column(nullable = false)
  private Double maxScore; // e.g., 20.0, 50.0, 100.0

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date evaluationDate;

  @Column(nullable = false)
  private Boolean isVisible = false; // Can students see this evaluation?

  @Column(nullable = false)
  private Boolean isGradesVisible = false; // Can students see their grades?

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EvaluationType type = EvaluationType.INTERROGATION;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date createdAt = new Date();

  /**
   * Enumeration of evaluation types.
   */
  public enum EvaluationType {
    INTERROGATION,
    EXAMEN,
    CONTROLE_CONTINU,
    PROJET,
    TRAVAIL_PRATIQUE,
    ORAL
  }
}
