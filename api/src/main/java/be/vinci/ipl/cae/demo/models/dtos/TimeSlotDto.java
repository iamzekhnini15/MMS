package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for TimeSlot creation and updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDto {
  private Long idTimeSlot;
  private String dayOfWeek; // MONDAY, TUESDAY, etc.
  private String startTime; // HH:mm format
  private String endTime; // HH:mm format
  private String name;
  private String description;
}
