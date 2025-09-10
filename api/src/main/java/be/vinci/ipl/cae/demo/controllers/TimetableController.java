package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ManualTimetableRequest;
import be.vinci.ipl.cae.demo.models.dtos.TimeSlotDto;
import be.vinci.ipl.cae.demo.models.dtos.TimetableDto;
import be.vinci.ipl.cae.demo.models.dtos.TimetableGenerationRequest;
import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import be.vinci.ipl.cae.demo.services.TimeSlotService;
import be.vinci.ipl.cae.demo.services.TimetableService;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing timetables.
 */
@RestController
@RequestMapping("/timetables")
@RequiredArgsConstructor
@Slf4j
public class TimetableController {

  private final TimetableService timetableService;
  private final TimeSlotService timeSlotService;

  /**
   * Generate a new timetable.
   *
   * @param request the generation request
   * @return the generated timetable
   */
  @PostMapping("/generate")
  public ResponseEntity<TimetableDto> generateTimetable(
      @RequestBody TimetableGenerationRequest request
  ) {
    try {
      TimetableDto timetable = timetableService.generateTimetable(request);
      return ResponseEntity.ok(timetable);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Create a new manual timetable.
   *
   * @param request the manual timetable request
   * @return the created timetable
   */
  @PostMapping("/manual")
  public ResponseEntity<?> createManualTimetable(@RequestBody ManualTimetableRequest request) {
    try {
      if (log.isInfoEnabled()) {
        log.info("Received manual timetable creation request: {}", request.getName());
      }
      TimetableDto timetable = timetableService.createManualTimetable(request);
      if (log.isInfoEnabled()) {
        log.info("Manual timetable created successfully with ID: {}", timetable.getIdTimetable());
      }
      return ResponseEntity.ok(timetable);
    } catch (RuntimeException e) {
      if (log.isErrorEnabled()) {
        log.error("Error creating manual timetable: {}", e.getMessage(), e);
      }
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage(), "timestamp", System.currentTimeMillis()));
    } catch (Exception e) {
      if (log.isErrorEnabled()) {
        log.error("Unexpected error creating manual timetable: {}", e.getMessage(), e);
      }
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Internal server error", "timestamp", System.currentTimeMillis()));
    }
  }

  /**
   * Get all timetables.
   *
   * @return list of all timetables
   */
  @GetMapping
  public ResponseEntity<List<TimetableDto>> getAllTimetables() {
    List<TimetableDto> timetables = timetableService.getAllTimetables();
    System.out.println(timetables);
    return ResponseEntity.ok(timetables);
  }

  /**
   * Get a specific timetable by ID.
   *
   * @param id the timetable ID
   * @return the timetable
   */
  @GetMapping("/{id}")
  public ResponseEntity<TimetableDto> getTimetableById(@PathVariable Long id) {
    try {
      TimetableDto timetable = timetableService.getTimetableById(id);
      return ResponseEntity.ok(timetable);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get entries for a specific timetable.
   *
   * @param id the timetable ID
   * @return the timetable entries
   */
  @GetMapping("/{id}/entries")
  public ResponseEntity<List<TimetableDto.TimetableEntryDto>> getTimetableEntries(
      @PathVariable Long id
  ) {
    try {
      List<TimetableDto.TimetableEntryDto> entries = timetableService.getTimetableEntries(id);
      return ResponseEntity.ok(entries);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get timetable for a specific class.
   *
   * @param classId the class ID
   * @return the timetable entries for that class
   */
  @GetMapping("/class/{classId}")
  public ResponseEntity<List<TimetableDto.TimetableEntryDto>> getTimetableForClass(
      @PathVariable Long classId
  ) {
    List<TimetableDto.TimetableEntryDto> entries = timetableService.getTimetableForClass(classId);
    return ResponseEntity.ok(entries);
  }

  /**
   * Get timetable for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @return the timetable entries for that teacher
   */
  @GetMapping("/teacher/{teacherId}")
  public ResponseEntity<List<TimetableDto.TimetableEntryDto>> getTimetableForTeacher(
      @PathVariable Long teacherId
  ) {
    List<TimetableDto.TimetableEntryDto> entries =
        timetableService.getTimetableForTeacher(teacherId);
    return ResponseEntity.ok(entries);
  }

  /**
   * Get timetable for a specific classroom.
   *
   * @param classroomId the classroom ID
   * @return the timetable entries for that classroom
   */
  @GetMapping("/classroom/{classroomId}")
  public ResponseEntity<List<TimetableDto.TimetableEntryDto>> getTimetableForClassroom(
      @PathVariable Long classroomId
  ) {
    List<TimetableDto.TimetableEntryDto> entries =
        timetableService.getTimetableForClassroom(classroomId);
    return ResponseEntity.ok(entries);
  }

  /**
   * Publish a timetable.
   *
   * @param id the timetable ID
   * @return the updated timetable
   */
  @PutMapping("/{id}/publish")
  public ResponseEntity<TimetableDto> publishTimetable(@PathVariable Long id) {
    try {
      TimetableDto timetable = timetableService.publishTimetable(id);
      return ResponseEntity.ok(timetable);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Delete a timetable.
   *
   * @param id the timetable ID
   * @return confirmation message
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteTimetable(@PathVariable Long id) {
    try {
      timetableService.deleteTimetable(id);
      return ResponseEntity.ok("Timetable deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Initialize default time slots.
   *
   * @return confirmation message
   */
  @PostMapping("/time-slots/init")
  public ResponseEntity<String> initializeTimeSlots() {
    timeSlotService.initializeDefaultTimeSlots();
    return ResponseEntity.ok("Default time slots initialized");
  }

  /**
   * Get all time slots.
   *
   * @return list of all time slots
   */
  @GetMapping("/time-slots")
  public ResponseEntity<List<TimeSlot>> getAllTimeSlots() {
    List<TimeSlot> timeSlots = timeSlotService.getAllTimeSlots();
    return ResponseEntity.ok(timeSlots);
  }

  /**
   * Create a new time slot.
   *
   * @param timeSlotDto the time slot data
   * @return the created time slot
   */
  @PostMapping("/time-slots")
  public ResponseEntity<TimeSlot> createTimeSlot(@RequestBody TimeSlotDto timeSlotDto) {
    try {
      DayOfWeek dayOfWeek = DayOfWeek.valueOf(timeSlotDto.getDayOfWeek().toUpperCase(Locale.ROOT));
      TimeSlot timeSlot = timeSlotService.createTimeSlot(
          dayOfWeek,
          timeSlotDto.getStartTime(),
          timeSlotDto.getEndTime(),
          timeSlotDto.getName(),
          timeSlotDto.getDescription()
      );
      return ResponseEntity.ok(timeSlot);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }
}
