package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;

@Data
public class FileDTO {
  private String name;
  private String url;
  private boolean isVisible;
}
