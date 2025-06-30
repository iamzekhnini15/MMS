package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.mappers.StudentMapper;
import be.vinci.ipl.cae.demo.models.dtos.StudentDTO;
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

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

  private final StudentService studentService;


  @GetMapping("/class/{id}")
  public ResponseEntity<List<Student>> getStudentsByClassId(@PathVariable Long id) {
    List<Student> students = studentService.getStudentsByClassId(id);
    return ResponseEntity.ok(students);
  }

  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody StudentDTO studentDTO) {
    System.out.println(studentDTO);
    Student student = StudentMapper.toEntity(studentDTO);
    studentService.addStudent(student);
    return ResponseEntity.ok("Teacher Created");
  }

}