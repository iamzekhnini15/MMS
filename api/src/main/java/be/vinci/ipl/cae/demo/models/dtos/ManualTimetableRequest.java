package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for manual timetable creation request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualTimetableRequest {
  private String name;
  private String description;
  private List<ManualTimetableEntryRequest> entries;

  /**
   * Represents a request to manually create or update a timetable entry.
   * Contains the necessary identifiers for class, course, teacher, classroom, and time slot.
   * ManualTimetableEntryRequest entry = new ManualTimetableEntryRequest(
   *     classId, courseId, teacherId, classroomId, timeSlotId
   * );
   *
   * @author YourName
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ManualTimetableEntryRequest {
    private Long classId;
    private Long courseId;
    private Long teacherId;
    private Long classroomId;
    private Long timeSlotId;
  }
}
