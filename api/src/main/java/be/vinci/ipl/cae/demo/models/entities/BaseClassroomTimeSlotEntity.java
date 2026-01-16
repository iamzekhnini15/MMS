  package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Base class for entities that have classroom and timeSlot relationships.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseClassroomTimeSlotEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClassroom", nullable = false)
  private Classroom classroom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTimeSlot", nullable = false)
  private TimeSlot timeSlot;
}
