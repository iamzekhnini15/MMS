package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing bulletin configuration for different calculation methods.
 */
@Entity
@Table(name = "bulletin_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BulletinConfig {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idConfig;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClass", nullable = false)
  private ClassEntity classEntity;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idPeriod", nullable = false)
  private BulletinPeriod bulletinPeriod;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AverageType averageType = AverageType.ARITHMETIC;

  @Column(nullable = false)
  private Boolean isPublished = false; // Are bulletins published for students?

  @Temporal(TemporalType.TIMESTAMP)
  private Date publishedAt; // When bulletins were published

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idPublishedBy")
  private User publishedBy; // Who published the bulletins

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date createdAt = new Date();

  /**
   * Enumeration of average calculation types.
   */
  public enum AverageType {
    ARITHMETIC,   // (a + b + c) / n
    WEIGHTED,     // Weighted by max score
    GEOMETRIC,    // nth root of (a * b * c)
    HARMONIC      // n / (1/a + 1/b + 1/c)
  }
}
