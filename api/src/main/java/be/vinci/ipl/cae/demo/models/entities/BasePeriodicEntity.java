package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

/**
 * Base class for entities that have a name and start/end dates.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BasePeriodicEntity {

  @Column(nullable = false)
  private String name;

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date startDate;

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date endDate;
}
