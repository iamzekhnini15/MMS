package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing teacher availability for specific time slots.
 * Used to define when teachers are available for scheduling.
 */
@Entity
@Table(name = "teacher_availabilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TeacherAvailability {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTeacherAvailability;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTimeSlot", nullable = false)
  private TimeSlot timeSlot;

  private Boolean isAvailable = true; // true = available, false = not available
}
