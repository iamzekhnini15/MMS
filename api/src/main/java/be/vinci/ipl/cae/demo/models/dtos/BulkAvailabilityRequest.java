package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO for bulk availability checking request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkAvailabilityRequest {
  private Long classId;
  private Long courseId;
  private Long teacherId;
  private Long classroomId;
  
  // Liste des créneaux à vérifier
  private List<Long> timeSlotIds;
  
  // Optionnel : pour exclure certaines entrées existantes lors de la modification
  private Long excludeTimetableEntryId;
}
