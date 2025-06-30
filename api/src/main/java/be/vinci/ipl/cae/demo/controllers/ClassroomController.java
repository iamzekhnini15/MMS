package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.services.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller to manage classroom entities.
 */
@RestController
@RequestMapping("/classroom")
@RequiredArgsConstructor
public class ClassroomController {

  /**
   * Service layer to handle classroom-related operations.
   */
  private final ClassroomService classroomService;

  /**
   * Retrieves all classrooms.
   *
   * @return a list of all classrooms.
   */
  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(classroomService.getAll());
  }

  /**
   * Creates a new classroom.
   *
   * @param classroom the classroom to create.
   * @return a success message.
   */
  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody Classroom classroom) {
    System.out.println("create classroom");
    System.out.println(classroom);
    classroomService.save(classroom);
    return ResponseEntity.ok("La salle de cours a été créée avec succès");
  }

  /**
   * Deletes a classroom by its ID.
   *
   * @param idClassroom the ID of the classroom to delete.
   * @return a confirmation message.
   */
  @DeleteMapping("/delete/{idClassroom}")
  public ResponseEntity<String> delete(@PathVariable Long idClassroom) {
    classroomService.deleteClassroom(idClassroom);
    return ResponseEntity.ok("Suppression de l'item confirmée");
  }
}
