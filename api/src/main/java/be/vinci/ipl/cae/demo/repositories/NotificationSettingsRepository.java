package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.NotificationSettings;
import be.vinci.ipl.cae.demo.models.entities.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing {@link NotificationSettings} entities.
 * Provides methods to perform CRUD operations and custom queries related to notification settings.
 *
 * @author (your name)
 */
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {
  /**
   * Finds the notification settings for a specific user.
   *
   * @param user The user whose notification settings are to be retrieved.
   * @return An Optional containing the NotificationSettings if found, or empty if not found.
   */
  Optional<NotificationSettings> findByUser(User user);
}
