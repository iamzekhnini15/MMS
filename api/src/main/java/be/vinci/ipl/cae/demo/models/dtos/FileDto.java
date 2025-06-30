package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;

/**
 * Data Transfer Object (DTO) representing a file.
 */
@Data
public class FileDto {
  private String name;
  private String url;
  private boolean isVisible;
}
