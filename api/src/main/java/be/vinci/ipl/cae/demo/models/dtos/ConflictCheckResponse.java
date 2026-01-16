package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
