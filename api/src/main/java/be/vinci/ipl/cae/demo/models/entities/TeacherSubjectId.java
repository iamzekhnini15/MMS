package be.vinci.ipl.cae.demo.models.entities;

import java.io.Serializable;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherSubjectId implements Serializable {
  private Long teacher;
  private Long subject;
}
