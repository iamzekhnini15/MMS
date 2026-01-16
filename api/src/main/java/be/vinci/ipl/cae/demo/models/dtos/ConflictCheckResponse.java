package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for conflict checking response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConflictCheckResponse {
  private boolean hasConflicts;
  private List<String> conflicts;
  private boolean teacherUnavailable;
  private boolean classroomUnavailable;
  private String teacherAvailabilityReason;
  private String classroomAvailabilityReason;
}
