package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for conflict checking request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConflictCheckRequest {
  private Long classId;
  private Long courseId;
  private Long teacherId;
  private Long classroomId;
  private Long timeSlotId;
  
  // Optionnel : pour exclure certaines entrées existantes lors de la modification
  private Long excludeTimetableEntryId;
}
