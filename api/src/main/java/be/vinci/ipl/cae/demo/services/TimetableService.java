package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.TimetableValidationException;
import be.vinci.ipl.cae.demo.models.dtos.ManualTimetableRequest;
import be.vinci.ipl.cae.demo.models.dtos.TimetableDto;
import be.vinci.ipl.cae.demo.models.dtos.TimetableGenerationRequest;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import be.vinci.ipl.cae.demo.models.entities.Timetable;
import be.vinci.ipl.cae.demo.models.entities.TimetableEntry;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.ClassroomRepository;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import be.vinci.ipl.cae.demo.repositories.TimeSlotRepository;
import be.vinci.ipl.cae.demo.repositories.TimetableEntryRepository;
import be.vinci.ipl.cae.demo.repositories.TimetableRepository;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing timetables.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {

  private final TimetableRepository timetableRepository;
  private final TimetableEntryRepository timetableEntryRepository;
  private final TimetableGeneratorService generatorService;
  private final TimetableValidationService validationService;
  private final ClassesRepository classesRepository;
  private final CourseRepository courseRepository;
  private final TeacherRepository teacherRepository;
  private final ClassroomRepository classroomRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
  private final SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
  private final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

  /**
   * Generate a new timetable.
   *
   * @param request the generation request
   * @return the generated timetable DTO
   */
  @Transactional
  public TimetableDto generateTimetable(TimetableGenerationRequest request) {
    Timetable timetable = generatorService.generateTimetable(request);
    return convertToDto(timetable);
  }

  /**
   * Create a manual timetable.
   *
   * @param request the manual timetable request
   * @return the created timetable DTO
   * @throws TimetableValidationException if validation fails
   */
  @Transactional
  public TimetableDto createManualTimetable(ManualTimetableRequest request) {
    if (log.isInfoEnabled()) {
      log.info("Creating manual timetable with name: {}", request.getName());
      log.info("Request has {} entries", request.getEntries().size());
    }

    // Create the timetable
    Timetable timetable = new Timetable();
    timetable.setName(request.getName());
    timetable.setDescription(request.getDescription());
    timetable.setStatus("DRAFT");
    timetable.setCreatedAt(new java.util.Date());

    // Set default dates (can be customized later)
    java.util.Calendar cal = java.util.Calendar.getInstance();
    timetable.setStartDate(cal.getTime());
    cal.add(java.util.Calendar.MONTH, 6); // 6 months validity
    timetable.setEndDate(cal.getTime());
    
    // Set academic year based on current date
    int currentYear = cal.get(java.util.Calendar.YEAR);
    int currentMonth = cal.get(java.util.Calendar.MONTH);
    if (currentMonth >= java.util.Calendar.SEPTEMBER) {
      timetable.setAcademicYear(currentYear + "-" + (currentYear + 1));
    } else {
      timetable.setAcademicYear((currentYear - 1) + "-" + currentYear);
    }

    timetable = timetableRepository.save(timetable);
    if (log.isInfoEnabled()) {
      log.info("Timetable created with ID: {}", timetable.getIdTimetable());
    }

    // Create the entries
    for (ManualTimetableRequest.ManualTimetableEntryRequest entryRequest : request.getEntries()) {
      if (log.isInfoEnabled()) {
        log.info("Processing entry - classId: {}, courseId: {}, teacherId: {}, "
            + "classroomId: {}, timeSlotId: {}",
            entryRequest.getClassId(), entryRequest.getCourseId(), entryRequest.getTeacherId(),
            entryRequest.getClassroomId(), entryRequest.getTimeSlotId());
      }

      TimetableEntry entry = new TimetableEntry();
      entry.setTimetable(timetable);

      // Load and set the entities
      try {
        ClassEntity classEntity = classesRepository.findById(entryRequest.getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found: "
            + entryRequest.getClassId()));
        entry.setClassEntity(classEntity);
        if (log.isDebugEnabled()) {
          log.debug("Found class: {}", classEntity.getName());
        }

        Course course = courseRepository.findById(entryRequest.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found: "
            + entryRequest.getCourseId()));
        entry.setCourse(course);
        if (log.isDebugEnabled()) {
          log.debug("Found course: {}", course.getName());
        }

        Teacher teacher = teacherRepository.findById(entryRequest.getTeacherId())
            .orElseThrow(() -> new RuntimeException("Teacher not found: "
            + entryRequest.getTeacherId()));
        entry.setTeacher(teacher);
        if (log.isDebugEnabled()) {
          log.debug("Found teacher: {} {}", teacher.getUser().getFirstname(),
              teacher.getUser().getLastname());
        }

        Classroom classroom = classroomRepository.findById(entryRequest.getClassroomId())
            .orElseThrow(() -> new RuntimeException("Classroom not found: "
            + entryRequest.getClassroomId()));
        entry.setClassroom(classroom);
        if (log.isDebugEnabled()) {
          log.debug("Found classroom: {}", classroom.getName());
        }

        TimeSlot timeSlot = timeSlotRepository.findById(entryRequest.getTimeSlotId())
            .orElseThrow(() -> new RuntimeException("TimeSlot not found: "
            + entryRequest.getTimeSlotId()));
        entry.setTimeSlot(timeSlot);
        if (log.isDebugEnabled()) {
          log.debug("Found timeSlot: {} {}-{}", timeSlot.getDayOfWeek(),
              timeSlot.getStartTime(), timeSlot.getEndTime());
        }

        // Valider les conflits AVANT de sauvegarder
        List<String> validationErrors = validationService.validateTimetableEntry(
            entryRequest.getClassId(),
            entryRequest.getCourseId(),
            entryRequest.getTeacherId(),
            entryRequest.getClassroomId(),
            entryRequest.getTimeSlotId()
        );

        if (!validationErrors.isEmpty()) {
          if (log.isWarnEnabled()) {
            log.warn("Validation failed: {}", validationErrors);
          }
          throw new TimetableValidationException(validationErrors);
        }

        timetableEntryRepository.save(entry);
        if (log.isInfoEnabled()) {
          log.info("Successfully created timetable entry");
        }

      } catch (Exception e) {
        if (log.isErrorEnabled()) {
          log.error("Error creating timetable entry: {}", e.getMessage(), e);
        }
        throw e;
      }
    }

    if (log.isInfoEnabled()) {
      log.info("Manual timetable creation completed successfully");
    }
    return convertToDto(timetable);
  }

  /**
   * Get all timetables.
   *
   * @return list of all timetables
   */
  public List<TimetableDto> getAllTimetables() {
    return timetableRepository.findAll().stream()
      .map(this::convertToDto)
      .collect(Collectors.toList());
  }

  /**
   * Get timetable by ID.
   *
   * @param id the timetable ID
   * @return the timetable DTO
   * @throws RuntimeException if timetable not found
   */
  public TimetableDto getTimetableById(Long id) {
    Timetable timetable = timetableRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Timetable not found: " + id));
    return convertToDto(timetable);
  }

  /**
   * Get entries for a specific timetable.
   *
   * @param id the timetable ID
   * @return the timetable entries
   * @throws RuntimeException if timetable not found
   */
  public List<TimetableDto.TimetableEntryDto> getTimetableEntries(Long id) {
    // Verify timetable exists
    timetableRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Timetable not found: " + id));

    List<TimetableEntry> entries = timetableEntryRepository.findByTimetableIdTimetable(id);
    return entries.stream()
      .map(this::convertEntryToDto)
      .collect(Collectors.toList());
  }

  /**
   * Get timetable for a specific class.
   *
   * @param classId the class ID
   * @return the timetable entries for that class
   */
  public List<TimetableDto.TimetableEntryDto> getTimetableForClass(Long classId) {
    List<TimetableEntry> entries = timetableEntryRepository.findByClassEntityIdClass(classId);
    return entries.stream()
      .map(this::convertEntryToDto)
      .collect(Collectors.toList());
  }

  /**
   * Get timetable for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @return the timetable entries for that teacher
   */
  public List<TimetableDto.TimetableEntryDto> getTimetableForTeacher(Long teacherId) {
    List<TimetableEntry> entries = timetableEntryRepository.findByTeacherIdTeacher(teacherId);
    return entries.stream()
      .map(this::convertEntryToDto)
      .collect(Collectors.toList());
  }

  /**
   * Get timetable for a specific classroom.
   *
   * @param classroomId the classroom ID
   * @return the timetable entries for that classroom
   */
  public List<TimetableDto.TimetableEntryDto> getTimetableForClassroom(Long classroomId) {
    List<TimetableEntry> entries = timetableEntryRepository.findByClassroomIdClassroom(classroomId);
    return entries.stream()
      .map(this::convertEntryToDto)
      .collect(Collectors.toList());
  }

  /**
   * Publish a timetable (change status to PUBLISHED).
   *
   * @param id the timetable ID
   * @return the updated timetable DTO
   * @throws RuntimeException if timetable not found
   */
  @Transactional
  public TimetableDto publishTimetable(Long id) {
    Timetable timetable = timetableRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Timetable not found: " + id));

    timetable.setStatus("PUBLISHED");
    timetable = timetableRepository.save(timetable);

    if (log.isInfoEnabled()) {
      log.info("Timetable published: {}", timetable.getName());
    }
    return convertToDto(timetable);
  }

  /**
   * Delete a timetable and all its entries.
   *
   * @param id the timetable ID
   * @throws RuntimeException if timetable not found
   */
  @Transactional
  public void deleteTimetable(Long id) {
    Timetable timetable = timetableRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Timetable not found: " + id));

    // Delete all entries first
    List<TimetableEntry> entries = timetableEntryRepository.findByTimetableIdTimetable(id);
    timetableEntryRepository.deleteAll(entries);

    // Delete the timetable
    timetableRepository.delete(timetable);

    if (log.isInfoEnabled()) {
      log.info("Timetable deleted: {}", timetable.getName());
    }
  }

  private TimetableDto convertToDto(Timetable timetable) {
    TimetableDto dto = new TimetableDto();
    dto.setIdTimetable(timetable.getIdTimetable());
    dto.setName(timetable.getName());
    dto.setStartDate(dateFormat.format(timetable.getStartDate()));
    dto.setEndDate(dateFormat.format(timetable.getEndDate()));
    dto.setStatus(timetable.getStatus());
    dto.setPublished("PUBLISHED".equals(timetable.getStatus()));
    dto.setCreatedAt(dateTimeFormat.format(timetable.getCreatedAt()));
    dto.setDescription(timetable.getDescription());

    // Load entries
    List<TimetableEntry> entries = timetableEntryRepository
        .findByTimetableIdTimetable(timetable.getIdTimetable());
    dto.setEntries(entries.stream()
        .map(this::convertEntryToDto)
        .collect(Collectors.toList()));

    return dto;
  }

  private TimetableDto.TimetableEntryDto convertEntryToDto(TimetableEntry entry) {
    TimetableDto.TimetableEntryDto dto = new TimetableDto.TimetableEntryDto();
    dto.setIdTimetableEntry(entry.getIdTimetableEntry());

    // Class info
    TimetableDto.ClassSummaryDto classDto = new TimetableDto.ClassSummaryDto();
    classDto.setIdClass(entry.getClassEntity().getIdClass());
    classDto.setName(entry.getClassEntity().getName());
    classDto.setLevel(entry.getClassEntity().getLevel());
    dto.setClassEntity(classDto);

    // Course info
    TimetableDto.CourseSummaryDto courseDto = new TimetableDto.CourseSummaryDto();
    courseDto.setIdCourse(entry.getCourse().getIdCourse());
    courseDto.setName(entry.getCourse().getName());
    dto.setCourse(courseDto);

    // Teacher info
    TimetableDto.TeacherSummaryDto teacherDto = new TimetableDto.TeacherSummaryDto();
    teacherDto.setIdTeacher(entry.getTeacher().getIdTeacher());
    teacherDto.setFirstname(entry.getTeacher().getUser().getFirstname());
    teacherDto.setLastname(entry.getTeacher().getUser().getLastname());
    dto.setTeacher(teacherDto);

    // Classroom info
    TimetableDto.ClassroomSummaryDto classroomDto = new TimetableDto.ClassroomSummaryDto();
    classroomDto.setIdClassroom(entry.getClassroom().getIdClassroom());
    classroomDto.setName(entry.getClassroom().getName());
    classroomDto.setLocation(entry.getClassroom().getLocation());
    dto.setClassroom(classroomDto);

    // TimeSlot info
    TimetableDto.TimeSlotSummaryDto timeSlotDto = new TimetableDto.TimeSlotSummaryDto();
    timeSlotDto.setIdTimeSlot(entry.getTimeSlot().getIdTimeSlot());
    timeSlotDto.setDayOfWeek(entry.getTimeSlot().getDayOfWeek().name());
    timeSlotDto.setStartTime(timeFormat.format(entry.getTimeSlot().getStartTime()));
    timeSlotDto.setEndTime(timeFormat.format(entry.getTimeSlot().getEndTime()));
    timeSlotDto.setName(entry.getTimeSlot().getName());
    dto.setTimeSlot(timeSlotDto);

    return dto;
  }
}