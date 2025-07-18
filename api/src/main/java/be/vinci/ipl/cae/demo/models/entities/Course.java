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
 * Représente un cours donné dans le système.
 * Un cours est associé à un professeur et une salle de classe,
 * et dispose d'une période de début et de fin.
 */
@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idCourse;

  @Column(nullable = false, unique = true)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClassroom", nullable = false)
  private Classroom classroom;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date startDateTime;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date endDateTime;
}
