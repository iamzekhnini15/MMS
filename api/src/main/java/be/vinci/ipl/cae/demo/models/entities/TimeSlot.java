package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.time.DayOfWeek;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a time slot in the school schedule.
 * Defines when classes can be scheduled (day of week + time range).
 */
@Entity
@Table(name = "time_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimeSlot {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTimeSlot;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DayOfWeek dayOfWeek; // MONDAY, TUESDAY, etc.

  @Temporal(TemporalType.TIME)
  @Column(nullable = false)
  private Date startTime; // Example: 14:00

  @Temporal(TemporalType.TIME)
  @Column(nullable = false)
  private Date endTime; // Example: 16:00

  @Column(nullable = false)
  private String name; // Example: "Lundi 14h-16h", "Période 1"

  @Column
  private String description; // Optional description
}
