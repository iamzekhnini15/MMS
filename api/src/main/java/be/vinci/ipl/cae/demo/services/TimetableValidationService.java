package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.TimetableEntry;
import be.vinci.ipl.cae.demo.repositories.TimetableEntryRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for validating timetable entries to prevent conflicts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableValidationService {

  private final TimetableEntryRepository timetableEntryRepository;

  /**
   * Validate a timetable entry for conflicts.
   *
   * @param classId the class ID
   * @param courseId the course ID
   * @param teacherId the teacher ID
   * @param classroomId the classroom ID
   * @param timeSlotId the time slot ID
   * @return list of validation errors (empty if no conflicts)
   */
  public List<String> validateTimetableEntry(
      Long classId,
      Long courseId,
      Long teacherId,
      Long classroomId,
      Long timeSlotId
  ) {
    List<String> errors = new ArrayList<>();
    
    if (log.isDebugEnabled()) {
      log.debug("Validating timetable entry: "
            + "classId={}, "
            + "courseId={}, "
            + "teacherId={}, "
            + "classroomId={}, "
            + "timeSlotId={}",
                classId, courseId, teacherId, classroomId, timeSlotId);
    }

    // 1. Vérifier si la classe a déjà un cours à ce créneau
    List<TimetableEntry> classConflicts =
        timetableEntryRepository.findConflictsByClassAndTimeSlot(classId, timeSlotId);
    if (!classConflicts.isEmpty()) {
      TimetableEntry conflict = classConflicts.get(0);
      errors.add(String.format("La classe a déjà un cours programmé à ce créneau : %s", 
                               conflict.getCourse().getName()));
    }

    // 2. Vérifier si le professeur est déjà occupé à ce créneau
    List<TimetableEntry> teacherConflicts =
        timetableEntryRepository.findConflictsByTeacherAndTimeSlot(teacherId, timeSlotId);
    if (!teacherConflicts.isEmpty()) {
      TimetableEntry conflict = teacherConflicts.get(0);
      errors.add(String.format("Le professeur est déjà occupé à ce créneau avec la classe : %s", 
                               conflict.getClassEntity().getName()));
    }

    // 3. Vérifier si la salle de classe est déjà occupée à ce créneau
    List<TimetableEntry> classroomConflicts =
        timetableEntryRepository.findConflictsByClassroomAndTimeSlot(classroomId, timeSlotId);
    if (!classroomConflicts.isEmpty()) {
      TimetableEntry conflict = classroomConflicts.get(0);
      errors.add(String.format(
          "La salle de classe est déjà occupée à ce créneau par : %s (classe %s)",
          conflict.getCourse().getName(),
          conflict.getClassEntity().getName())
      );
    }

    if (log.isDebugEnabled()) {
      log.debug("Validation completed with {} errors", errors.size());
    }
    return errors;
  }
}
