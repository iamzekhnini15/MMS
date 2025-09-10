package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.TimetableGenerationRequest;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.models.entities.ClassroomAvailability;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.TeacherAvailability;
import be.vinci.ipl.cae.demo.models.entities.TeacherSubject;
import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import be.vinci.ipl.cae.demo.models.entities.Timetable;
import be.vinci.ipl.cae.demo.models.entities.TimetableEntry;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.ClassroomAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.ClassroomRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherSubjectRepository;
import be.vinci.ipl.cae.demo.repositories.TimeSlotRepository;
import be.vinci.ipl.cae.demo.repositories.TimetableEntryRepository;
import be.vinci.ipl.cae.demo.repositories.TimetableRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for generating timetables using constraint satisfaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableGeneratorService {

  private final TimetableRepository timetableRepository;
  private final TimetableEntryRepository timetableEntryRepository;
  private final ClassesRepository classesRepository;
  private final SubjectRepository subjectRepository;
  private final TeacherRepository teacherRepository;
  private final ClassroomRepository classroomRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final TeacherSubjectRepository teacherSubjectRepository;
  private final TeacherAvailabilityRepository teacherAvailabilityRepository;
  private final ClassroomAvailabilityRepository classroomAvailabilityRepository;

  /**
   * Generate a timetable based on the given requirements.
   *
   * @param request the generation request
   * @return the generated timetable
   */
  public Timetable generateTimetable(TimetableGenerationRequest request) {
    if (log.isInfoEnabled()) {
      log.info("Starting timetable generation for: {}", request.getName());
    }
    
    // Create the timetable entity
    Timetable timetable = new Timetable();
    timetable.setName(request.getName());
    timetable.setStartDate(parseDate(request.getStartDate()));
    timetable.setEndDate(parseDate(request.getEndDate()));
    timetable.setStatus("DRAFT");
    timetable = timetableRepository.save(timetable);
    
    // Load all necessary data
    List<TimeSlot> availableTimeSlots =
        timeSlotRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();
    Map<Long, List<TeacherSubject>> teacherSubjects = loadTeacherSubjects();
    
    // Generate schedule requirements
    List<ScheduleRequirement> requirements = buildScheduleRequirements(request, teacherSubjects);
    
    // Apply constraint satisfaction algorithm
    boolean success = solveWithBacktracking(timetable, requirements, availableTimeSlots);
    
    if (success) {
      if (log.isInfoEnabled()) {
        log.info("Timetable generation completed successfully");
      }
    } else {
      if (log.isWarnEnabled()) {
        log.warn("Timetable generation completed with partial solution");
      }
    }
    
    return timetable;
  }

  private List<ScheduleRequirement> buildScheduleRequirements(
      TimetableGenerationRequest request, Map<Long, List<TeacherSubject>> teacherSubjects) {
    
    List<ScheduleRequirement> requirements = new ArrayList<>();
    
    for (var classReq : request.getClassRequirements()) {
      ClassEntity classEntity = classesRepository.findById(classReq.getClassId())
          .orElseThrow(() -> new RuntimeException("Class not found: " + classReq.getClassId()));
      
      for (var subjectReq : classReq.getSubjects()) {
        Subject subject = subjectRepository.findById(subjectReq.getSubjectId())
            .orElseThrow(() -> new RuntimeException(
                "Subject not found: " + subjectReq.getSubjectId())
            );
        
        // Find qualified teachers for this subject
        List<Teacher> qualifiedTeachers = findQualifiedTeachers(subjectReq, teacherSubjects);
        
        // Create requirements for each needed hour
        for (int hour = 0; hour < subjectReq.getHoursPerWeek(); hour++) {
          ScheduleRequirement req = new ScheduleRequirement();
          req.classEntity = classEntity;
          req.subject = subject;
          req.qualifiedTeachers = qualifiedTeachers;
          req.preferredClassrooms = loadPreferredClassrooms(subjectReq.getPreferredClassroomIds());
          requirements.add(req);
        }
      }
    }
    
    return requirements;
  }

  private boolean solveWithBacktracking(
      Timetable timetable,
      List<ScheduleRequirement> requirements,
      List<TimeSlot> timeSlots) {
    return backtrack(timetable, requirements, 0, new ArrayList<>(), timeSlots);
  }

  private boolean backtrack(
      Timetable timetable,
      List<ScheduleRequirement> requirements,
      int reqIndex,
      List<TimetableEntry> currentSolution,
      List<TimeSlot> timeSlots) {
    
    if (reqIndex >= requirements.size()) {
      // All requirements satisfied, save the solution
      timetableEntryRepository.saveAll(currentSolution);
      return true;
    }
    
    ScheduleRequirement req = requirements.get(reqIndex);
    
    // Try each time slot
    for (TimeSlot timeSlot : timeSlots) {
      // Try each qualified teacher
      for (Teacher teacher : req.qualifiedTeachers) {
        // Try each preferred classroom
        for (Classroom classroom : req.preferredClassrooms) {
          
          if (isValidAssignment(req, teacher, classroom, timeSlot, currentSolution)) {
            // Create the assignment
            TimetableEntry entry = new TimetableEntry();
            entry.setTimetable(timetable);
            entry.setClassEntity(req.classEntity);
            entry.setCourse(req.subject.getCourse()); // Use the Course from Subject
            entry.setTeacher(teacher);
            entry.setClassroom(classroom);
            entry.setTimeSlot(timeSlot);
            
            currentSolution.add(entry);
            
            // Recursively solve the rest
            if (backtrack(timetable, requirements, reqIndex + 1, currentSolution, timeSlots)) {
              return true;
            }
            
            // Backtrack
            currentSolution.remove(currentSolution.size() - 1);
          }
        }
      }
    }
    
    return false; // No valid assignment found
  }

  private boolean isValidAssignment(ScheduleRequirement req, Teacher teacher, Classroom classroom, 
                                   TimeSlot timeSlot, List<TimetableEntry> currentSolution) {
    
    // Check teacher availability
    TeacherAvailability teacherAvail = teacherAvailabilityRepository
        .findByTeacherIdTeacherAndTimeSlotIdTimeSlot(
            teacher.getIdTeacher(),
            timeSlot.getIdTimeSlot()
        );
    if (teacherAvail != null && !teacherAvail.getIsAvailable()) {
      return false;
    }
    
    // Check classroom availability
    ClassroomAvailability classroomAvail = classroomAvailabilityRepository
        .findByAvailableClassroomIdClassroomAndAvailableTimeSlotIdTimeSlot(
            classroom.getIdClassroom(),
            timeSlot.getIdTimeSlot()
        );
    if (classroomAvail != null && !classroomAvail.getIsAvailable()) {
      return false;
    }
    
    // Check for conflicts in current solution
    for (TimetableEntry entry : currentSolution) {
      if (entry.getTimeSlot().getIdTimeSlot().equals(timeSlot.getIdTimeSlot())) {
        // Same time slot - check for conflicts
        if (entry.getTeacher().getIdTeacher().equals(teacher.getIdTeacher())
            || entry.getClassroom().getIdClassroom().equals(classroom.getIdClassroom())
            || entry.getClassEntity().getIdClass().equals(req.classEntity.getIdClass())) {
          return false; // Conflict found
        }
      }
    }
    
    return true;
  }

  private List<Teacher> findQualifiedTeachers(
      TimetableGenerationRequest.SubjectRequirement subjectReq,
      Map<Long, List<TeacherSubject>> teacherSubjects) {

    List<Teacher> qualified = new ArrayList<>();
    
    if (subjectReq.getPreferredTeacherIds() != null
        && !subjectReq.getPreferredTeacherIds().isEmpty()) {
      // Use preferred teachers if specified
      for (Long teacherId : subjectReq.getPreferredTeacherIds()) {
        teacherRepository.findById(teacherId).ifPresent(qualified::add);
      }
    } else {
      // Find all teachers qualified for this subject using the pre-loaded map
      for (Map.Entry<Long, List<TeacherSubject>> entry : teacherSubjects.entrySet()) {
        for (TeacherSubject ts : entry.getValue()) {
          if (ts.getSubject().getIdSubject().equals(subjectReq.getSubjectId())) {
            qualified.add(ts.getTeacher());
          }
        }
      }
    }
    
    return qualified;
  }

  private List<Classroom> loadPreferredClassrooms(List<Long> classroomIds) {
    if (classroomIds == null || classroomIds.isEmpty()) {
      return (List<Classroom>) classroomRepository.findAll();
    }
    
    List<Classroom> classrooms = new ArrayList<>();
    for (Long id : classroomIds) {
      classroomRepository.findById(id).ifPresent(classrooms::add);
    }
    return classrooms;
  }

  private Map<Long, List<TeacherSubject>> loadTeacherSubjects() {
    Map<Long, List<TeacherSubject>> map = new HashMap<>();
    List<TeacherSubject> all = (List<TeacherSubject>) teacherSubjectRepository.findAll();
    
    for (TeacherSubject ts : all) {
      map.computeIfAbsent(ts.getTeacher().getIdTeacher(), k -> new ArrayList<>()).add(ts);
    }
    
    return map;
  }

  private java.util.Date parseDate(String dateStr) {
    try {
      return new java.text.SimpleDateFormat("yyyy-MM-dd").parse(dateStr);
    } catch (Exception e) {
      throw new RuntimeException("Invalid date format: " + dateStr, e);
    }
  }

  // Helper class for schedule requirements
  private static final class ScheduleRequirement {
    ClassEntity classEntity;
    Subject subject;
    List<Teacher> qualifiedTeachers;
    List<Classroom> preferredClassrooms;
  }
}
