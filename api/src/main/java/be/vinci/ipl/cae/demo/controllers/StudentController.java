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
  private final be.vinci.ipl.cae.demo.services.StudentCourseService studentCourseService;

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
   * Retrieves a specific student by ID.
   *
   * @param id the ID of the student.
   * @return A ResponseEntity containing the student.
   */
  @GetMapping("/{id}")
  public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
    try {
      Student student = studentService.getStudentById(id);
      return ResponseEntity.ok(student);
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
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

  /**
   * Retrieves all courses associated with a specific student ID.
   *
   * @param id the ID of the student.
   * @return A ResponseEntity containing the list of courses.
   */
  @GetMapping("/{id}/courses")
  public ResponseEntity<List<be.vinci.ipl.cae.demo.models.entities.Course>> 
      getCoursesForStudent(@PathVariable Long id) {
    return ResponseEntity.ok(studentCourseService.getCoursesForStudent(id));
  }

  /**
   * Retrieves all courses associated with the authenticated student.
   *
   * @return A ResponseEntity containing the list of courses.
   */
  @GetMapping("/me/courses")
  public ResponseEntity<List<be.vinci.ipl.cae.demo.models.entities.Course>> 
      getMyResources() {
    // Pour l'instant on retourne les cours du premier étudiant (simulation)
    // Dans une vraie app, on récupèrerait l'ID depuis le JWT/session
    Long studentId = 1L; // À remplacer par l'ID de l'utilisateur connecté
    return ResponseEntity.ok(studentCourseService.getCoursesForStudent(studentId));
  }
}
