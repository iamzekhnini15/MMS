package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Teacher;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassEntityDTO {

  private Long idClass;
  private String name;
  private String level;
  private String department;
  private TeacherDTO responsibleTeacher;
  private List<StudentDTO> students;

}
