package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TimetableEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for TimetableEntry entity operations.
 */
@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
  
  /**
   * Find all entries for a specific timetable.
   *
   * @param timetableId the timetable ID
   * @return list of timetable entries
   */
  List<TimetableEntry> findByTimetableIdTimetable(Long timetableId);
  
  /**
   * Find all entries for a specific class.
   *
   * @param classId the class ID
   * @return list of timetable entries for that class
   */
  List<TimetableEntry> findByClassEntityIdClass(Long classId);
  
  /**
   * Find all entries for a specific teacher.
   *
   * @param teacherId the teacher ID
   * @return list of timetable entries for that teacher
   */
  List<TimetableEntry> findByTeacherIdTeacher(Long teacherId);
  
  /**
   * Find all entries for a specific classroom.
   *
   * @param classroomId the classroom ID
   * @return list of timetable entries for that classroom
   */
  List<TimetableEntry> findByClassroomIdClassroom(Long classroomId);
  
  /**
   * Check for conflicts in a specific time slot.
   *
   * @param timetableId the timetable ID
   * @param timeSlotId the time slot ID
   * @param teacherId the teacher ID (optional)
   * @param classroomId the classroom ID (optional)
   * @param classId the class ID (optional)
   * @return list of conflicting entries
   */
  @Query("SELECT te FROM TimetableEntry te WHERE te.timetable.idTimetable = :timetableId "
      + "AND te.timeSlot.idTimeSlot = :timeSlotId "
      + "AND (te.teacher.idTeacher = :teacherId "
      + "OR te.classroom.idClassroom = :classroomId "
      + "OR te.classEntity.idClass = :classId)")
  List<TimetableEntry> findConflicts(@Param("timetableId") Long timetableId,
                                    @Param("timeSlotId") Long timeSlotId,
                                    @Param("teacherId") Long teacherId,
                                    @Param("classroomId") Long classroomId,
                                    @Param("classId") Long classId);

  /**
   * Find entries for a specific class and time slot.
   *
   * @param classId the class ID
   * @param timeSlotId the time slot ID
   * @return list of conflicting entries
   */
  @Query("SELECT te FROM TimetableEntry te WHERE te.classEntity.idClass = :classId "
      + "AND te.timeSlot.idTimeSlot = :timeSlotId"
  )
  List<TimetableEntry> findConflictsByClassAndTimeSlot(
      @Param("classId") Long classId,
      @Param("timeSlotId") Long timeSlotId
  );

  /**
   * Find entries for a specific teacher and time slot.
   *
   * @param teacherId the teacher ID
   * @param timeSlotId the time slot ID
   * @return list of conflicting entries
   */
  @Query("SELECT te FROM TimetableEntry te "
      + "WHERE te.teacher.idTeacher = :teacherId "
      + "AND te.timeSlot.idTimeSlot = :timeSlotId"
  )
  List<TimetableEntry> findConflictsByTeacherAndTimeSlot(
      @Param("teacherId") Long teacherId,
      @Param("timeSlotId") Long timeSlotId
  );

  /**
   * Find entries for a specific classroom and time slot.
   *
   * @param classroomId the classroom ID
   * @param timeSlotId the time slot ID
   * @return list of conflicting entries
   */
  @Query("SELECT te FROM TimetableEntry te WHERE te.classroom.idClassroom = :classroomId "
      + "AND te.timeSlot.idTimeSlot = :timeSlotId"
  )
  List<TimetableEntry> findConflictsByClassroomAndTimeSlot(
      @Param("classroomId") Long classroomId,
      @Param("timeSlotId") Long timeSlotId
  );
}
