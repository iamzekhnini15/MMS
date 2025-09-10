package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing the notification settings for a user.
 * This class stores the user's preferences for receiving different types of notifications,
 * such as email, SMS, in-app, grade, course, and bulletin notifications.
 * Each instance is associated with a single user.
 *
 * @author YourName
 */
@Entity
@Table(name = "notification_settings")
@Data
@NoArgsConstructor
public class NotificationSettings {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "id_user", nullable = false)
  private User user;

  @Column(nullable = false)
  private boolean emailNotifications = true;

  @Column(nullable = false)
  private boolean smsNotifications = false;

  @Column(nullable = false)
  private boolean inAppNotifications = true;

  @Column(nullable = false)
  private boolean gradeNotifications = true;

  @Column(nullable = false)
  private boolean courseNotifications = true;

  @Column(nullable = false)
  private boolean bulletinNotifications = true;
}
