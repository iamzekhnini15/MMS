package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import java.time.DayOfWeek;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for TimeSlot entity operations.
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
  
  /**
   * Find all time slots for a specific day of the week.
   *
   * @param dayOfWeek the day of the week
   * @return list of time slots for that day
   */
  List<TimeSlot> findByDayOfWeekOrderByStartTime(DayOfWeek dayOfWeek);
  
  /**
   * Find all time slots ordered by day and start time.
   *
   * @return all time slots in chronological order
   */
  List<TimeSlot> findAllByOrderByDayOfWeekAscStartTimeAsc();
}
