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
 * Entity representing a timetable (emploi du temps).
 * Groups multiple timetable entries for a specific period/semester.
 */
@Entity
@Table(name = "timetables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Timetable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTimetable;

  @Column(nullable = false)
  private String name; // Example: "Emploi du temps - Semestre 1 2025"

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date startDate; // Start of validity period

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date endDate; // End of validity period

  @Column(nullable = false)
  private String academicYear; // e.g., "2024-2025"

  @Column(nullable = false)
  private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date createdAt = new Date();

  @Column
  private String description; // Optional description
}
