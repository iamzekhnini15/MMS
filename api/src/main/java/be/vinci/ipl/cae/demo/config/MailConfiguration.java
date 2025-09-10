package be.vinci.ipl.cae.demo.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Mail configuration for notifications.
 */
@Configuration
public class MailConfiguration {

  /**
   * Create a JavaMailSender bean only when mail is enabled.
   * This allows the application to start even without mail configuration.
   */
  @Bean
  @ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true", matchIfMissing = false)
  public JavaMailSender javaMailSender() {
    return new JavaMailSenderImpl();
  }

  /**
   * Fallback JavaMailSender when mail is disabled.
   * This is a dummy implementation that does nothing.
   */
  @Bean
  @ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
  public JavaMailSender dummyMailSender() {
    return new JavaMailSenderImpl() {
        @Override
        public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
            // Do nothing - mail is disabled
            System.out.println("Mail disabled: Would send email to "
                  + (simpleMessage.getTo() != null && simpleMessage.getTo().length > 0
                        ? simpleMessage.getTo()[0] : "unknown")
                  + " with subject: " + simpleMessage.getSubject());
        }
    };
  }
}
