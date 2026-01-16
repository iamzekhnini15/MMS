package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Base class for entities that have teacher and classroom relationships.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseTeacherClassroomEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClassroom", nullable = false)
  private Classroom classroom;
}
