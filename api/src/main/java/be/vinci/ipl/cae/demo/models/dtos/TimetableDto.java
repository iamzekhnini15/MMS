package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for timetable response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableDto {
  private Long idTimetable;
  private String name;
  private String startDate;
  private String endDate;
  private String status;
  private boolean isPublished;
  private String createdAt;
  private String description;
  private List<TimetableEntryDto> entries;

  /**
   * DTO for a single timetable entry.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TimetableEntryDto {
    private Long idTimetableEntry;
    private ClassSummaryDto classEntity;
    private CourseSummaryDto course;
    private TeacherSummaryDto teacher;
    private ClassroomSummaryDto classroom;
    private TimeSlotSummaryDto timeSlot;
  }

  /**
   * Summary information about a class, including its identifier, name, and level.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ClassSummaryDto {
    private Long idClass;
    private String name;
    private String level;
  }

  /**
   * Summary information about a course, including its identifier and name.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CourseSummaryDto {
    private Long idCourse;
    private String name;
  }

  /**
   * Summary information about a teacher, including their identifier and full
   * name.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TeacherSummaryDto {
    private Long idTeacher;
    private String firstname;
    private String lastname;
  }

  /**
   * Summary information about a classroom, including its identifier, name, and
   * location.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ClassroomSummaryDto {
    private Long idClassroom;
    private String name;
    private String location;
  }

  /**
   * Summary information about a time slot, including its identifier, day of the
   * week, start time, end time, and name.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TimeSlotSummaryDto {
    private Long idTimeSlot;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String name;
  }
}
