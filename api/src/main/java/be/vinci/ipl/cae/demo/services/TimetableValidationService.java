package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.BulkAvailabilityRequest;
import be.vinci.ipl.cae.demo.models.dtos.BulkAvailabilityResponse;
import be.vinci.ipl.cae.demo.models.dtos.ConflictCheckRequest;
import be.vinci.ipl.cae.demo.models.dtos.ConflictCheckResponse;
import be.vinci.ipl.cae.demo.models.entities.ClassroomAvailability;
import be.vinci.ipl.cae.demo.models.entities.TeacherAvailability;
import be.vinci.ipl.cae.demo.models.entities.TimetableEntry;
import be.vinci.ipl.cae.demo.repositories.ClassroomAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.TimeSlotRepository;
import be.vinci.ipl.cae.demo.repositories.TimetableEntryRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
  private final TeacherAvailabilityRepository teacherAvailabilityRepository;
  private final ClassroomAvailabilityRepository classroomAvailabilityRepository;
  private final TimeSlotRepository timeSlotRepository;

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

  /**
   * Check for conflicts and availability for a timetable entry.
   * This method provides comprehensive conflict checking including:
   * - Teacher/classroom/class conflicts with existing entries
   * - Teacher availability constraints
   * - Classroom availability constraints
   *
   * @param request the conflict check request
   * @return comprehensive conflict check response
   */
  public ConflictCheckResponse checkConflicts(ConflictCheckRequest request) {
    List<String> conflicts = new ArrayList<>();

    if (log.isDebugEnabled()) {
      log.debug("Checking conflicts for request: {}", request);
    }

    // 1. Vérifier si la classe a déjà un cours à ce créneau
    List<TimetableEntry> classConflicts = filterExcludedEntry(
        timetableEntryRepository.findConflictsByClassAndTimeSlot(
            request.getClassId(), 
            request.getTimeSlotId()
        ),
        request.getExcludeTimetableEntryId()
    );
    
    if (!classConflicts.isEmpty()) {
      TimetableEntry conflict = classConflicts.get(0);
      conflicts.add(String.format("La classe a déjà un cours programmé à ce créneau : %s", 
                                 conflict.getCourse().getName()));
    }

    // 2. Vérifier si le professeur est déjà occupé à ce créneau
    if (request.getTeacherId() != null) {
      List<TimetableEntry> teacherConflicts = filterExcludedEntry(
          timetableEntryRepository.findConflictsByTeacherAndTimeSlot(
              request.getTeacherId(), 
              request.getTimeSlotId()
          ),
          request.getExcludeTimetableEntryId()
      );
      
      if (!teacherConflicts.isEmpty()) {
        TimetableEntry conflict = teacherConflicts.get(0);
        conflicts.add(String.format(
            "Le professeur est déjà occupé à ce créneau " 
                + "avec la classe : %s", 
            conflict.getClassEntity().getName()));
      }

      // 3. Vérifier la disponibilité du professeur
      TeacherAvailability teacherAvail = teacherAvailabilityRepository
          .findByTeacherIdTeacherAndTimeSlotIdTimeSlot(
              request.getTeacherId(),
              request.getTimeSlotId()
          );
      
      if (teacherAvail != null && !teacherAvail.getIsAvailable()) {
        conflicts.add(
            "Le professeur n'est pas disponible à ce créneau");
      }
    }

    // 4. Vérifier si la salle de classe est déjà occupée à ce créneau
    if (request.getClassroomId() != null) {
      List<TimetableEntry> classroomConflicts = filterExcludedEntry(
          timetableEntryRepository.findConflictsByClassroomAndTimeSlot(
              request.getClassroomId(), 
              request.getTimeSlotId()
          ),
          request.getExcludeTimetableEntryId()
      );
      
      if (!classroomConflicts.isEmpty()) {
        TimetableEntry conflict = classroomConflicts.get(0);
        conflicts.add(String.format(
            "La salle de classe est déjà occupée à ce créneau par : %s (classe %s)",
            conflict.getCourse().getName(),
            conflict.getClassEntity().getName())
        );
      }

      // 5. Vérifier la disponibilité de la salle
      ClassroomAvailability classroomAvail = classroomAvailabilityRepository
          .findByAvailableClassroomIdClassroomAndAvailableTimeSlotIdTimeSlot(
              request.getClassroomId(),
              request.getTimeSlotId()
          );
      
      if (classroomAvail != null && !classroomAvail.getIsAvailable()) {
        conflicts.add(
            "La salle n'est pas disponible à ce créneau");
      }
    }

    boolean hasConflicts = !conflicts.isEmpty();

    if (log.isDebugEnabled()) {
      log.debug(
          "Conflict check completed: hasConflicts={}, conflicts={}",
          hasConflicts, conflicts.size());
    }

    return new ConflictCheckResponse(
        hasConflicts,
        conflicts,
        false,
        false,
        null,
        null
    );
  }

  /**
   * Filter out excluded timetable entry from conflicts list.
   *
   * @param conflicts the list of conflicting entries
   * @param excludeId the ID to exclude (can be null)
   * @return filtered list
   */
  private List<TimetableEntry> filterExcludedEntry(
      List<TimetableEntry> conflicts, Long excludeId) {
    if (excludeId == null) {
      return conflicts;
    }
    return conflicts.stream()
        .filter(entry -> !entry.getIdTimetableEntry().equals(excludeId))
        .toList();
  }


  /**
   * Check if a time slot is available for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @param timeSlotId the time slot ID
   * @return true if available, false otherwise
   */
  public boolean isTeacherAvailableForTimeSlot(Long teacherId, Long timeSlotId) {
    // Vérifier s'il y a déjà un cours programmé
    List<TimetableEntry> conflicts = timetableEntryRepository
        .findConflictsByTeacherAndTimeSlot(teacherId, timeSlotId);
    if (!conflicts.isEmpty()) {
      return false;
    }

    // Vérifier les disponibilités définies
    TeacherAvailability availability = teacherAvailabilityRepository
        .findByTeacherIdTeacherAndTimeSlotIdTimeSlot(teacherId, timeSlotId);
    
    // Si aucune disponibilité n'est définie, on considère que le professeur est disponible
    // Si une disponibilité est définie, on respecte le flag isAvailable
    return availability == null || availability.getIsAvailable();
  }

  /**
   * Check if a time slot is available for a specific classroom.
   *
   * @param classroomId the classroom ID
   * @param timeSlotId the time slot ID
   * @return true if available, false otherwise
   */
  public boolean isClassroomAvailableForTimeSlot(Long classroomId, Long timeSlotId) {
    // Vérifier s'il y a déjà un cours programmé
    List<TimetableEntry> conflicts = timetableEntryRepository
        .findConflictsByClassroomAndTimeSlot(classroomId, timeSlotId);
    if (!conflicts.isEmpty()) {
      return false;
    }

    // Vérifier les disponibilités définies
    ClassroomAvailability availability = classroomAvailabilityRepository
        .findByAvailableClassroomIdClassroomAndAvailableTimeSlotIdTimeSlot(classroomId, timeSlotId);
    
    // Si aucune disponibilité n'est définie, on considère que la salle est disponible
    // Si une disponibilité est définie, on respecte le flag isAvailable
    return availability == null || availability.getIsAvailable();
  }

  /**
   * Vérification optimisée de la disponibilité pour plusieurs créneaux en une seule requête.
   * Cette méthode évite les appels répétés à l'API en traitant tous les créneaux d'un coup.
   *
   * @param request la requête de vérification groupée
   * @return map avec l'état de disponibilité de chaque créneau
   */
  public BulkAvailabilityResponse checkBulkAvailability(
      BulkAvailabilityRequest request) {
    if (log.isDebugEnabled()) {
      log.debug("Checking bulk availability for {} time slots",
          request.getTimeSlotIds().size());
    }

    // Récupérer tous les conflits existants pour optimiser les requêtes
    List<TimetableEntry> existingEntries = new ArrayList<>();
    
    // Conflits de classe pour tous les créneaux
    for (Long timeSlotId : request.getTimeSlotIds()) {
      List<TimetableEntry> classConflicts = filterExcludedEntry(
          timetableEntryRepository.findConflictsByClassAndTimeSlot(
              request.getClassId(), timeSlotId),
          request.getExcludeTimetableEntryId()
      );
      existingEntries.addAll(classConflicts);
    }

    // Conflits de professeur si spécifié
    if (request.getTeacherId() != null) {
      for (Long timeSlotId : request.getTimeSlotIds()) {
        List<TimetableEntry> teacherConflicts = filterExcludedEntry(
            timetableEntryRepository
                .findConflictsByTeacherAndTimeSlot(
                    request.getTeacherId(), timeSlotId),
            request.getExcludeTimetableEntryId()
        );
        existingEntries.addAll(teacherConflicts);
      }
    }

    // Conflits de salle si spécifiée
    if (request.getClassroomId() != null) {
      for (Long timeSlotId : request.getTimeSlotIds()) {
        List<TimetableEntry> classroomConflicts = filterExcludedEntry(
            timetableEntryRepository
                .findConflictsByClassroomAndTimeSlot(
                    request.getClassroomId(), timeSlotId),
            request.getExcludeTimetableEntryId()
        );
        existingEntries.addAll(classroomConflicts);
      }
    }

    // Récupérer les disponibilités en une fois
    Map<Long, TeacherAvailability> teacherAvailabilities = new HashMap<>();
    Map<Long, ClassroomAvailability> classroomAvailabilities = new HashMap<>();
    
    if (request.getTeacherId() != null) {
      List<TeacherAvailability> availList = teacherAvailabilityRepository
          .findByTeacherIdTeacher(request.getTeacherId());
      for (TeacherAvailability avail : availList) {
        teacherAvailabilities.put(avail.getTimeSlot().getIdTimeSlot(), avail);
      }
    }
    
    if (request.getClassroomId() != null) {
      List<ClassroomAvailability> availList = classroomAvailabilityRepository
          .findByAvailableClassroomIdClassroom(request.getClassroomId());
      for (ClassroomAvailability avail : availList) {
        classroomAvailabilities.put(avail.getAvailableTimeSlot().getIdTimeSlot(), avail);
      }
    }

    // Analyser chaque créneau
    Map<Long, BulkAvailabilityResponse.TimeSlotAvailability> 
        availabilities = new HashMap<>();
    for (Long timeSlotId : request.getTimeSlotIds()) {
      BulkAvailabilityResponse.TimeSlotAvailability availability = 
          analyzeTimeSlotAvailability(
              timeSlotId, existingEntries, teacherAvailabilities, 
              classroomAvailabilities, request);
      availabilities.put(timeSlotId, availability);
    }

    if (log.isDebugEnabled()) {
      long availableSlots = availabilities.values().stream()
          .mapToLong(avail -> avail.isAvailable() ? 1 : 0)
          .sum();
      log.debug(
          "Bulk availability check completed: {}/{} slots available", 
               availableSlots, request.getTimeSlotIds().size());
    }

    return new BulkAvailabilityResponse(availabilities);
  }

  /**
   * Analyse la disponibilité d'un créneau spécifique.
   */
  private BulkAvailabilityResponse.TimeSlotAvailability analyzeTimeSlotAvailability(
      Long timeSlotId,
      List<TimetableEntry> existingEntries,
      Map<Long, TeacherAvailability> teacherAvailabilities,
      Map<Long, ClassroomAvailability> classroomAvailabilities,
      BulkAvailabilityRequest request) {
    
    // Vérifier les conflits de classe
    for (TimetableEntry entry : existingEntries) {
      if (entry.getTimeSlot().getIdTimeSlot().equals(timeSlotId)
          && entry.getClassEntity().getIdClass().equals(request.getClassId())) {
        return new BulkAvailabilityResponse.TimeSlotAvailability(
            false,
            "La classe a déjà un cours programmé à ce créneau : " + entry.getCourse().getName(),
            BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.CLASS_BUSY
        );
      }
    }

    // Vérifier les conflits de professeur
    if (request.getTeacherId() != null) {
      for (TimetableEntry entry : existingEntries) {
        if (entry.getTimeSlot().getIdTimeSlot().equals(timeSlotId)
            && entry.getTeacher().getIdTeacher()
                .equals(request.getTeacherId())) {
          return new BulkAvailabilityResponse.TimeSlotAvailability(
              false,
              "Le professeur est déjà occupé à ce créneau " 
                  + "avec la classe : " 
                  + entry.getClassEntity().getName(),
              BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.TEACHER_BUSY
          );
        }
      }

      // Vérifier la disponibilité du professeur
      TeacherAvailability teacherAvail = teacherAvailabilities.get(timeSlotId);
      if (teacherAvail != null && !teacherAvail.getIsAvailable()) {
        return new BulkAvailabilityResponse.TimeSlotAvailability(
            false,
            "Le professeur n'est pas disponible à ce créneau",
            BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.TEACHER_UNAVAILABLE
        );
      }
    }

    // Vérifier les conflits de salle
    if (request.getClassroomId() != null) {
      for (TimetableEntry entry : existingEntries) {
        if (entry.getTimeSlot().getIdTimeSlot().equals(timeSlotId)
            && entry.getClassroom().getIdClassroom().equals(request.getClassroomId())) {
          return new BulkAvailabilityResponse.TimeSlotAvailability(
              false,
              "La salle est déjà occupée à ce créneau par : " + entry.getCourse().getName()
                + " (classe " + entry.getClassEntity().getName() + ")",
              BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.CLASSROOM_BUSY
          );
        }
      }

      // Vérifier la disponibilité de la salle
      ClassroomAvailability classroomAvail = classroomAvailabilities.get(timeSlotId);
      if (classroomAvail != null && !classroomAvail.getIsAvailable()) {
        return new BulkAvailabilityResponse.TimeSlotAvailability(
            false,
            "La salle n'est pas disponible à ce créneau",
            BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.CLASSROOM_UNAVAILABLE
        );
      }
    }

    // Aucun conflit détecté
    return new BulkAvailabilityResponse.TimeSlotAvailability(
        true,
        "Créneau disponible",
        BulkAvailabilityResponse.TimeSlotAvailability.ConflictType.NONE
    );
  }
}
