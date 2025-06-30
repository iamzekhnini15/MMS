package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.services.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseService courseService;

  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(courseService.getAll());
  }

  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody Course course) {
    courseService.save(course);
    return ResponseEntity.ok("Le cours a été créé avec succès");
  }

  @DeleteMapping("/delete/{idCourse}")
  public ResponseEntity<String> delete(@PathVariable Long idCourse) {

    courseService.deleteCourse(idCourse);
    return ResponseEntity.ok("Suppression de l'item confirmée");
  }



}
