package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.mappers.TeacherMapper;
import be.vinci.ipl.cae.demo.models.dtos.AddressDTO;
import be.vinci.ipl.cae.demo.models.dtos.TeacherDTO;
import be.vinci.ipl.cae.demo.models.dtos.UserDTO;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.services.TeacherService;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/teachers")
@RequiredArgsConstructor
public class TeacherController {

  private final TeacherService teacherService;

  @GetMapping("/getAll")
  public ResponseEntity<List<Teacher>> getAllTeachers() {
    List<Teacher> teachers = teacherService.getAllTeachers();
    return ResponseEntity.ok(teachers);
  }

  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody TeacherDTO teacherDTO) {
    Teacher teacher = TeacherMapper.toEntity(teacherDTO);
    teacherService.addTeacher(teacher);
    return ResponseEntity.ok("Teacher Created");
  }

}
