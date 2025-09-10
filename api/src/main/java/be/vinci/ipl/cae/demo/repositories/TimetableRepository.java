package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Timetable;
import java.util.Date;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Timetable entity operations.
 */
@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
  
  /**
   * Find timetables by status.
   *
   * @param status the timetable status
   * @return list of timetables with the specified status
   */
  List<Timetable> findByStatusOrderByCreatedAtDesc(String status);
  
  /**
   * Find active timetables for a given date.
   *
   * @param date the date to check
   * @return list of active timetables covering that date
   */
  @Query("SELECT t FROM Timetable t "
      + "WHERE t.startDate <= :date "
      + "AND t.endDate >= :date "
      + "AND t.status = 'PUBLISHED'"
  )
  List<Timetable> findActiveTimetablesForDate(@Param("date") Date date);
}
