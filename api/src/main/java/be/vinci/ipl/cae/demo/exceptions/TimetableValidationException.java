package be.vinci.ipl.cae.demo.exceptions;

import java.util.List;

/**
 * Exception thrown when timetable validation conflicts are detected.
 */
public class TimetableValidationException extends RuntimeException {
  
  private final List<String> validationErrors;

  /**
   * Constructor for TimetableValidationException.
   *
   * @param validationErrors List of validation error messages.
   */
  public TimetableValidationException(List<String> validationErrors) {
    super("Conflits détectés dans l'emploi du temps : " + String.join("; ", validationErrors));
    this.validationErrors = validationErrors;
  }
  
  public List<String> getValidationErrors() {
    return validationErrors;
  }
}
