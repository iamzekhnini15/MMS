package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ClassEntityDTO;
import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.services.ClassroomService;
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
@RequestMapping("/classroom")
@RequiredArgsConstructor
public class ClassroomController {

  private final ClassroomService classroomService;

  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(classroomService.getAll());
  }

  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody Classroom classroom) {
    System.out.println("create classroom");
    System.out.println(classroom);
    classroomService.save(classroom);
    return ResponseEntity.ok("La salle de cours a été créée avec succès");
  }

  @DeleteMapping("/delete/{idClassroom}")
  public ResponseEntity<String> delete(@PathVariable Long idClassroom) {

    classroomService.deleteClassroom(idClassroom);
    return ResponseEntity.ok("Suppression de l'item confirmée");
  }

}

