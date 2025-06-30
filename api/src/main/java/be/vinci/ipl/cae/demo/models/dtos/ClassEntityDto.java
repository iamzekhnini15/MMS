package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a class entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassEntityDto {

  private Long idClass;
  private String name;
  private String level;
  private String department;
  private TeacherDto responsibleTeacher;
  private List<StudentDto> students;

}
