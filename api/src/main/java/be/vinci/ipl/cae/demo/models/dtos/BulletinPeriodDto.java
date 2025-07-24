package be.vinci.ipl.cae.demo.models.dtos;

import java.util.Date;
import lombok.Data;

/**
 * DTO for BulletinPeriod entity.
 */
@Data
public class BulletinPeriodDto {
  private Long idPeriod;
  private String name;
  private Date startDate;
  private Date endDate;
  private String academicYear;
  private Boolean isActive;
  private String description;
}
