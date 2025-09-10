package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.NotificationSettings;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.NotificationSettingsRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling notification settings and sending notifications to users.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

  private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

  private final NotificationSettingsRepository repository;
  private final UserRepository userRepository;
  private final JavaMailSender mailSender;

  @Value("${app.mail.from:no-reply@example.com}")
  private String fromEmail;

  /**
   * Gets notification settings for a user, creating default settings if none exist.
   *
   * @param user the user to get settings for
   * @return the notification settings for the user
   */
  public NotificationSettings getForUser(User user) {
    Optional<NotificationSettings> s = repository.findByUser(user);
    return s.orElseGet(() -> {
      NotificationSettings ns = new NotificationSettings();
      ns.setUser(user);
      return repository.save(ns);
    });
  }

  /**
   * Saves notification settings for a user, updating existing settings or creating new ones.
   *
   * @param user the user to save settings for
   * @param settings the notification settings to save
   * @return the saved notification settings
   */
  @Transactional
  public NotificationSettings saveForUser(User user, NotificationSettings settings) {
    Optional<NotificationSettings> existing = repository.findByUser(user);
    if (existing.isPresent()) {
      NotificationSettings ns = existing.get();
      ns.setEmailNotifications(settings.isEmailNotifications());
      ns.setSmsNotifications(settings.isSmsNotifications());
      ns.setInAppNotifications(settings.isInAppNotifications());
      ns.setGradeNotifications(settings.isGradeNotifications());
      ns.setCourseNotifications(settings.isCourseNotifications());
      ns.setBulletinNotifications(settings.isBulletinNotifications());
      return repository.save(ns);
    } else {
      settings.setUser(user);
      return repository.save(settings);
    }
  }

  /**
   * Sends a test email to a user.
   *
   * @param user the user to send the email to
   * @param subject the email subject
   * @param body the email body
   * @throws RuntimeException if email sending fails
   */
  public void sendTestEmail(User user, String subject, String body) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(fromEmail);
      message.setTo(user.getEmail());
      message.setSubject(subject);
      message.setText(body);
      mailSender.send(message);
      if (logger.isInfoEnabled()) {
        logger.info("Test email sent to user: {}", user.getEmail());
      }
    } catch (Exception e) {
      if (logger.isErrorEnabled()) {
        logger.error("Failed to send test email to user: {}", user.getEmail(), e);
      }
      throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
    }
  }

  /**
   * Sends a test SMS to a user (not implemented).
   *
   * @param user the user to send the SMS to
   * @param body the SMS body
   * @throws UnsupportedOperationException always, as SMS is not configured
   */
  public void sendTestSms(User user, String body) {
    // SMS not configured in this build. To enable SMS, provide a concrete implementation
    // or configure Twilio credentials in application properties and add the dependency.
    throw new UnsupportedOperationException("SMS provider not configured. Configure Twilio or "
      + "another SMS adapter to enable SMS sending.");
  }

  // Contextual notification methods

  /**
   * Send grade notification to a student when new grades are published.
   *
   * @param studentId the ID of the student
   * @param subjectName the name of the subject
   * @param evaluationTitle the title of the evaluation
   */
  public void notifyGradePublished(Long studentId, String subjectName, String evaluationTitle) {
    try {
      User student = validateStudentForNotification(studentId, "grade");
      if (student == null) {
        return;
      }

      String subject = "Nouvelle note disponible - " + subjectName;
      String body = String.format(
          "Bonjour %s,\n\n"
            + "Une nouvelle note a été publiée pour l'évaluation \"%s\" dans la matière %s.\n\n"
            + "Vous pouvez consulter vos notes en vous connectant à votre espace étudiant.\n\n"
            + "Cordialement,\n"
            + "L'équipe pédagogique",
          student.getFirstname(),
          evaluationTitle,
          subjectName
      );

      createAndSendEmail(
          student,
          subject,
          body,
          "Grade notification sent to student: "
            + student.getEmail()
      );
    } catch (Exception e) {
      if (logger.isErrorEnabled()) {
        logger.error("Failed to send grade notification to student ID: {}", studentId, e);
      }
    }
  }

  /**
   * Send bulletin notification to a student when bulletin is published.
   *
   * @param studentId the ID of the student
   * @param periodName the name of the period
   */
  public void notifyBulletinPublished(Long studentId, String periodName) {
    try {
      User student = validateStudentForNotification(studentId, "bulletin");
      if (student == null) {
        return;
      }

      String subject = "Bulletin disponible - " + periodName;
      String body = String.format(
          "Bonjour %s,\n\n"
            + "Votre bulletin pour la période \"%s\" est maintenant disponible.\n\n"
            + "Vous pouvez le consulter et le télécharger depuis votre espace étudiant.\n\n"
            + "Cordialement,\n"
            + "L'équipe pédagogique",
          student.getFirstname(),
          periodName
      );

      createAndSendEmail(
          student,
          subject,
          body,
          "Bulletin notification sent to student: "
            + student.getEmail()
      );
    } catch (Exception e) {
      if (logger.isErrorEnabled()) {
        logger.error("Failed to send bulletin notification to student ID: {}", studentId, e);
      }
    }
  }

  /**
   * Send course notification to students when course details change.
   *
   * @param courseId the ID of the course
   * @param courseName the name of the course
   * @param changeDescription the description of the change
   */
  public void notifyStudentsOfCourseChange(
      Long courseId,
      String courseName,
      String changeDescription) {
    try {
      // This would require a method to get students enrolled in a course
      // For now, this is a placeholder - you would implement the logic to get course students
      if (logger.isInfoEnabled()) {
        logger.info("Course change notification would be sent for course: {} - {}",
            courseName, changeDescription);
      }
    } catch (Exception e) {
      if (logger.isErrorEnabled()) {
        logger.error("Failed to send course change notification for course ID: {}", courseId, e);
      }
    }
  }

  /**
   * Helper method to send email and log the result.
   *
   * @param message the email message to send
   * @param successLogMessage the message to log on success
   */
  private void sendEmailAndLog(SimpleMailMessage message, String successLogMessage) {
    mailSender.send(message);
    if (logger.isInfoEnabled()) {
      logger.info(successLogMessage);
    }
  }

  /**
   * Helper method to create and send an email message.
   *
   * @param student the recipient student
   * @param subject the email subject
   * @param body the email body
   * @param logMessage the message to log on success
   */
  private void createAndSendEmail(User student, String subject, String body, String logMessage) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmail);
    message.setTo(student.getEmail());
    message.setSubject(subject);
    message.setText(body);
    sendEmailAndLog(message, logMessage);
  }

  /**
   * Helper method to validate student and notification settings.
   *
   * @param studentId the student ID
   * @param notificationType the type of notification (grade or bulletin)
   * @return the student user if valid and notifications enabled, null otherwise
   */
  private User validateStudentForNotification(Long studentId, String notificationType) {
    User student = userRepository.findById(studentId).orElse(null);
    if (student == null) {
      return null;
    }

    NotificationSettings settings = getForUser(student);
    if (!settings.isEmailNotifications()) {
      return null;
    }

    if ("grade".equals(notificationType) && !settings.isGradeNotifications()) {
      return null;
    }

    if ("bulletin".equals(notificationType) && !settings.isBulletinNotifications()) {
      return null;
    }

    return student;
  }
}