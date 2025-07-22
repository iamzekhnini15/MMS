package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a bulletin period (trimester, semester, etc.).
 */
@Entity
@Table(name = "bulletin_periods")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BulletinPeriod {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idPeriod;

  @Column(nullable = false)
  private String name; // e.g., "1er Trimestre", "2ème Semestre"

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date startDate;

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date endDate;

  @Column(nullable = false)
  private String academicYear; // e.g., "2024-2025"

  @Column(nullable = false)
  private Boolean isActive = true;

  private String description; // Optional description
}
