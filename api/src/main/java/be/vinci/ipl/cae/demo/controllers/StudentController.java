package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.mappers.StudentMapper;
import be.vinci.ipl.cae.demo.models.dtos.StudentDto;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.services.StudentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller managing student-related endpoints.
 */
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

  private final StudentService studentService;

  /**
   * Retrieves all students associated with a specific class ID.
   *
   * @param id the ID of the class.
   * @return A ResponseEntity containing the list of students.
   */
  @GetMapping("/class/{id}")
  public ResponseEntity<List<Student>> getStudentsByClassId(@PathVariable Long id) {
    List<Student> students = studentService.getStudentsByClassId(id);
    return ResponseEntity.ok(students);
  }

  /**
   * Creates a new student based on the provided DTO.
   *
   * @param studentDto the DTO containing student information.
   * @return A ResponseEntity indicating successful creation.
   */
  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody StudentDto studentDto) {
    System.out.println(studentDto);
    Student student = StudentMapper.toEntity(studentDto);
    studentService.addStudent(student);
    return ResponseEntity.ok("Teacher Created");
  }
}
