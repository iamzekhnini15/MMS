package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * DTO for bulk availability checking response.
 * Contient l'état de disponibilité pour tous les créneaux demandés.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkAvailabilityResponse {
  
  /**
   * Map où la clé est l'ID du créneau et la valeur est l'état de disponibilité
   */
  private Map<Long, TimeSlotAvailability> availabilities;
  
  /**
   * Représente l'état de disponibilité d'un créneau spécifique
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TimeSlotAvailability {
    private boolean available;
    private String reason; // Raison si non disponible
    private ConflictType conflictType;
    
    public enum ConflictType {
      NONE,
      TEACHER_BUSY,
      CLASSROOM_BUSY,
      CLASS_BUSY,
      TEACHER_UNAVAILABLE,
      CLASSROOM_UNAVAILABLE
    }
  }
}
