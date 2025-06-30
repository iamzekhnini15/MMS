package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDTO {
  private String name;
  private String description;
  private Integer coefficient;
  private Long idCourse; // C'est ça qu'on attend depuis le front
}
