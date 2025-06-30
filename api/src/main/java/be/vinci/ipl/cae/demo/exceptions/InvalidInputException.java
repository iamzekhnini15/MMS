package be.vinci.ipl.cae.demo.exceptions;

/**
 * Exception levée lorsqu'une entrée utilisateur est invalide.
 */
public class InvalidInputException extends RuntimeException {

  public InvalidInputException() {
    super();
  }

  public InvalidInputException(String message) {
    super(message);
  }
}
