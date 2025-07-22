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
 * Entity representing a generated student bulletin.
 */
@Entity
@Table(name = "student_bulletins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentBulletin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idBulletin;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idStudent", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idPeriod", nullable = false)
  private BulletinPeriod bulletinPeriod;

  @Column(nullable = false)
  private Double generalAverage; // Overall average for the period

  @Column(nullable = false)
  private Integer classRank; // Student's rank in class

  @Column(nullable = false)
  private Integer totalStudents; // Total students in class

  @Column(nullable = false)
  private Double classAverage; // Class average for comparison

  @Column(length = 1000)
  private String generalComment; // General teacher/admin comment

  @Column(nullable = false)
  private String pdfFilePath; // Path to generated PDF

  @Column(nullable = false)
  private Boolean isVisible = false; // Can student see this bulletin?

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date generatedAt = new Date();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idGeneratedBy", nullable = false)
  private User generatedBy; // Who generated this bulletin
}
