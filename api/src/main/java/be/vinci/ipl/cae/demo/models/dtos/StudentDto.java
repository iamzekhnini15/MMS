package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a student.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
  private Long idStudent; // Ajouté pour identifier l'étudiant
  private UserDto user;
  private String dateOfBirth;
  private Long classId; // Remplace ClassEntityDTO pour éviter la circularité
  private String className; // Optionnel: nom de la classe
}
