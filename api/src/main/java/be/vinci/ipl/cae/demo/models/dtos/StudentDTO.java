package be.vinci.ipl.cae.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
  private Long idStudent; // Ajouté pour identifier l'étudiant
  private UserDTO user;
  private String dateOfBirth;
  private Long classId; // Remplace ClassEntityDTO pour éviter la circularité
  private String className; // Optionnel: nom de la classe
}
