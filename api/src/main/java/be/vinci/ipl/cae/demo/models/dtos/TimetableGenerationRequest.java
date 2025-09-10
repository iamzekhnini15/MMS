package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for timetable generation request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableGenerationRequest {
  private String name;
  private String startDate; // yyyy-MM-dd format
  private String endDate; // yyyy-MM-dd format
  private List<ClassScheduleRequirement> classRequirements;
  private TimetableGenerationOptions options;

  /**
   * Represents a requirement for a particular class in the timetable.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ClassScheduleRequirement {
    private Long classId;
    private List<SubjectRequirement> subjects;
  }

  /**
   * Represents the requirement for a specific subject within a class's timetable.
   */  
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SubjectRequirement {
    private Long subjectId;
    private Integer hoursPerWeek; // Number of hours per week for this subject
    private List<Long> preferredTeacherIds; // List of teacher IDs who can teach this subject
    private List<Long> preferredClassroomIds; // List of classroom IDs suitable for this subject
  }

  /**
   * Options for timetable generation, such as time limits and priorities.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TimetableGenerationOptions {
    // Maximum time to spend generating
    private Integer maxTimeoutSeconds = 30;
    // Allow partial solutions if complete one not found
    private Boolean allowPartialSolution = true;
    // BALANCED, TEACHER_PREFERRED, TIME_EFFICIENCY
    private String priority = "BALANCED";
  }
}
