package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Représente une note obtenue par un étudiant pour un cours donné.
 * Chaque note est associée à une date d'évaluation et peut comporter des remarques.
 */
@Entity
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Grade {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idGrade;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idStudent", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idCourse", nullable = false)
  private Course course;

  @Column(nullable = false)
  private Double gradeValue;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date evaluationDate;

  private String remarks;
}

