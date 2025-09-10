package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import be.vinci.ipl.cae.demo.repositories.TimeSlotRepository;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service for managing time slots.
 */
@Service
@RequiredArgsConstructor
public class TimeSlotService {

  private final TimeSlotRepository timeSlotRepository;
  private final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

  /**
   * Get all time slots ordered by day and time.
   *
   * @return list of all time slots
   */
  public List<TimeSlot> getAllTimeSlots() {
    return timeSlotRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();
  }

  /**
   * Get time slots for a specific day.
   *
   * @param dayOfWeek the day of week
   * @return list of time slots for that day
   */
  public List<TimeSlot> getTimeSlotsForDay(DayOfWeek dayOfWeek) {
    return timeSlotRepository.findByDayOfWeekOrderByStartTime(dayOfWeek);
  }

  /**
   * Create a new time slot.
   *
   * @param dayOfWeek day of the week
   * @param startTime start time in HH:mm format
   * @param endTime end time in HH:mm format
   * @param name display name for the slot
   * @param description optional description
   * @return created time slot
   */
  public TimeSlot createTimeSlot(DayOfWeek dayOfWeek, String startTime, String endTime, 
                                String name, String description) {
    try {
      Date start = timeFormat.parse(startTime);
      Date end = timeFormat.parse(endTime);
      
      TimeSlot timeSlot = new TimeSlot();
      timeSlot.setDayOfWeek(dayOfWeek);
      timeSlot.setStartTime(start);
      timeSlot.setEndTime(end);
      timeSlot.setName(name);
      timeSlot.setDescription(description);
      
      return timeSlotRepository.save(timeSlot);
    } catch (ParseException e) {
      throw new RuntimeException("Invalid time format. Use HH:mm", e);
    }
  }

  /**
   * Initialize default time slots for a week.
   * Creates standard school time slots if none exist.
   */
  public void initializeDefaultTimeSlots() {
    if (timeSlotRepository.count() == 0) {
      // Create default time slots for each day
      DayOfWeek[] days = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                          DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};
      String[] timeSlots = {"08:00-10:00", "10:15-12:15", "14:00-16:00", "16:15-18:15"};
      
      for (DayOfWeek day : days) {
        for (int i = 0; i < timeSlots.length; i++) {
          String[] times = timeSlots[i].split("-");
          String name = day.name().substring(0, 3) + " " + timeSlots[i];
          createTimeSlot(day, times[0], times[1], name, "Période " + (i + 1));
        }
      }
    }
  }
}
