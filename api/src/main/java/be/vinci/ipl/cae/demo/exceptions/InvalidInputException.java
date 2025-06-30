package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception thrown when a user input is invalid.
 */
public class InvalidInputException extends RuntimeException {

  /**
   * Constructs a new InvalidInputException with no detail message.
   */
  public InvalidInputException() {
    super();
  }

  /**
   * Constructs a new InvalidInputException with the specified detail message.
   *
   * @param message the detail message.
   */
  public InvalidInputException(String message) {
    super(message);
  }
}

