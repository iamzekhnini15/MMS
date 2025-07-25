package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Base class for entities that have Subject and ClassEntity relationships.
 */
@MappedSuperclass
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SubjectClassBaseEntity {

  /**
   * Protected constructor to prevent direct instantiation.
   */
  protected SubjectClassBaseEntity() {
    // Protected constructor for inheritance only
  }

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idSubject", nullable = false)
  private Subject subject;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClass", nullable = false)
  private ClassEntity classEntity;
}
