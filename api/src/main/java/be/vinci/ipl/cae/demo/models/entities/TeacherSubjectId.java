package be.vinci.ipl.cae.demo.models.entities;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Composite primary key class for TeacherSubject entity.
 * Represents the composite key consisting of teacher ID and subject ID.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSubjectId implements Serializable {
  private Long teacher;
  private Long subject;
}
