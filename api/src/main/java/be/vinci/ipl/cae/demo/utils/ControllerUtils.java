package be.vinci.ipl.cae.demo.utils;

import java.util.Optional;
import java.util.function.Supplier;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for common controller operations.
 */
public final class ControllerUtils {

  private ControllerUtils() {
    // Utility class
  }

  /**
   * Handle an update operation that returns an Optional.
   *
   * @param updateOperation the update operation
   * @param <T> the type of the result
   * @return ResponseEntity with appropriate status
   */
  public static <T> ResponseEntity<T> handleUpdateOperation(Supplier<Optional<T>> updateOperation) {
    try {
      Optional<T> result = updateOperation.get();
      return result.map(ResponseEntity::ok)
          .orElse(ResponseEntity.notFound().build());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Handle a service operation with standard exception handling.
   *
   * @param operation the service operation to execute
   * @param <T> the type of the result
   * @return ResponseEntity with appropriate status
   */
  public static <T> ResponseEntity<T> handleServiceOperation(Supplier<T> operation) {
    try {
      T result = operation.get();
      return ResponseEntity.ok(result);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }
}
