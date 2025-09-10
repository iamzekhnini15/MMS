package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.NotificationSettings;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing user notification settings.
 */
@RestController
@RequestMapping("/users/me/notifications")
public class NotificationSettingsController {

  private final NotificationService notificationService;

  /**
   * Constructor for NotificationSettingsController.
   *
   * @param notificationService the injected NotificationService.
   */
  public NotificationSettingsController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Get the currently authenticated user.
   *
   * @return the authenticated user, or null if not authenticated.
   */
  private User getAuthenticatedUser() {
    Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if ("anonymousUser".equals(p)) {
      return null;
    }
    return (User) p;
  }

  /**
   * Get the notification settings for the currently authenticated user.
   *
   * @return the notification settings, or a 401 response if not authenticated.
   */
  @GetMapping
  public ResponseEntity<NotificationSettings> getSettings() {
    User user = getAuthenticatedUser();
    if (user == null) {
      return ResponseEntity.status(401).build();
    }
    NotificationSettings settings = notificationService.getForUser(user);
    return ResponseEntity.ok(settings);
  }

  /**
   * Update the notification settings for the currently authenticated user.
   *
   * @param settings the new notification settings.
   * @return the updated notification settings, or a 401 response if not authenticated.
   */
  @PutMapping
  public ResponseEntity<NotificationSettings> updateSettings(
      @RequestBody NotificationSettings settings
  ) {
    User user = getAuthenticatedUser();
    if (user == null)  {
      return ResponseEntity.status(401).build();
    }
    NotificationSettings saved = notificationService.saveForUser(user, settings);
    return ResponseEntity.ok(saved);
  }

  /**
   * Send a test email to the currently authenticated user.
   *
   * @param ignored ignored body content
   * @return 200 OK if successful, 401 if not authenticated, 502 if sending fails
   */
  @PostMapping("/test-email")
  public ResponseEntity<Object> testEmail(@RequestBody String ignored) {
    User user = getAuthenticatedUser();
    if (user == null) {
      return ResponseEntity.status(401).build();
    }
    try {
      notificationService.sendTestEmail(user, "Test de notification", "Ceci est un test");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      // return a 502 Bad Gateway when upstream mail sending fails with a readable message
      String msg = e.getMessage() == null ? "Failed to send test email" : e.getMessage();
      return ResponseEntity.status(502).body(
          java.util.Map.of("error", "email_send_failed", "message", msg)
      );
    }
  }

  /**
   * Send a test SMS to the currently authenticated user.
   *
   * @param ignored ignored body content
   * @return 200 OK if successful, 401 if not authenticated, 502 if sending fails
   */
  @PostMapping("/test-sms")
  public ResponseEntity<Object> testSms(@RequestBody String ignored) {
    User user = getAuthenticatedUser();
    if (user == null) {
      return ResponseEntity.status(401).build();
    }
    try {
      notificationService.sendTestSms(user, "Test SMS");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      String msg = e.getMessage() == null ? "Failed to send test sms" : e.getMessage();
      return ResponseEntity.status(502).body(
        java.util.Map.of("error", "sms_send_failed", "message", msg)
      );
    }
  }
}
