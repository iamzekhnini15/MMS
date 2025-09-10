package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ClassroomAvailability;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for ClassroomAvailability entity operations.
 */
@Repository
public interface ClassroomAvailabilityRepository
    extends JpaRepository<ClassroomAvailability, Long> {

  /**
   * Find all availabilities for a specific classroom.
   *
   * @param classroomId the classroom ID
   * @return list of classroom availabilities
   */
  List<ClassroomAvailability> findByAvailableClassroomIdClassroom(Long classroomId);

  /**
   * Find availability for a classroom in a specific time slot.
   *
   * @param classroomId the classroom ID
   * @param timeSlotId the time slot ID
   * @return classroom availability if exists
   */
  ClassroomAvailability findByAvailableClassroomIdClassroomAndAvailableTimeSlotIdTimeSlot(
      Long classroomId, Long timeSlotId);

  /**
   * Find all available classrooms for a specific time slot.
   *
   * @param timeSlotId the time slot ID
   * @return list of available classroom availabilities
   */
  List<ClassroomAvailability> findByAvailableTimeSlotIdTimeSlotAndIsAvailableTrue(Long timeSlotId);
}