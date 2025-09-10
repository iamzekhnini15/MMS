package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TeacherAvailability;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for TeacherAvailability entity operations.
 */
@Repository
public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, Long> {
  
  /**
   * Find all availabilities for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @return list of teacher availabilities
   */
  List<TeacherAvailability> findByTeacherIdTeacher(Long teacherId);
  
  /**
   * Find availability for a teacher in a specific time slot.
   *
   * @param teacherId the teacher ID
   * @param timeSlotId the time slot ID
   * @return teacher availability if exists
   */
  TeacherAvailability findByTeacherIdTeacherAndTimeSlotIdTimeSlot(Long teacherId, Long timeSlotId);
  
  /**
   * Find all available teachers for a specific time slot.
   *
   * @param timeSlotId the time slot ID
   * @return list of available teacher availabilities
   */
  List<TeacherAvailability> findByTimeSlotIdTimeSlotAndIsAvailableTrue(Long timeSlotId);
}
