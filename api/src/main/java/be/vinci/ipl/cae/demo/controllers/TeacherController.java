package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.mappers.TeacherMapper;
import be.vinci.ipl.cae.demo.models.dtos.TeacherDto;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.services.TeacherService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller to handle HTTP requests related to teachers.
 * Provides endpoints to get all teachers and to create a new teacher.
 */
@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {

  private final TeacherService teacherService;

  /**
   * Retrieves all teachers.
   *
   * @return ResponseEntity containing the list of all teachers
   */
  @GetMapping("/getAll")
  public ResponseEntity<List<Teacher>> getAllTeachers() {
    List<Teacher> teachers = teacherService.getAllTeachers();
    return ResponseEntity.ok(teachers);
  }

  /**
   * Creates a new teacher from the given TeacherDto.
   *
   * @param teacherDto the data transfer object for teacher creation
   * @return ResponseEntity with confirmation message
   */
  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody TeacherDto teacherDto) {
    Teacher teacher = TeacherMapper.toEntity(teacherDto);
    teacherService.addTeacher(teacher);
    return ResponseEntity.ok("Teacher Created");
  }
}
