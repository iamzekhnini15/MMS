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
 * Entity representing a single entry in a timetable.
 * Links a class, subject, teacher, classroom and time slot together.
 */
@Entity
@Table(name = "timetable_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableEntry extends BaseSchedulingEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTimetableEntry;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTimetable", nullable = false)
  private Timetable timetable;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClass", nullable = false)
  private ClassEntity classEntity;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idCourse", nullable = false)
  private Course course;
}
