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
 * Entity representing classroom availability for specific time slots.
 * Used to define when classrooms are available for scheduling.
 */
@Entity
@Table(name = "classroom_availabilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClassroomAvailability {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idClassroomAvailability;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClassroom", nullable = false)
  private Classroom availableClassroom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTimeSlot", nullable = false)
  private TimeSlot availableTimeSlot;

  private Boolean isAvailable = true; // true = available, false = not available
}
