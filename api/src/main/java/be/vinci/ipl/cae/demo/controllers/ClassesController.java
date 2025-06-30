package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ClassEntityDto;
import be.vinci.ipl.cae.demo.services.ClassesService;
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
 * REST controller to manage class entities.
 */
@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassesController {

  /**
   * Service layer to handle class-related operations.
   */
  private final ClassesService classesService;

  /**
   * Retrieves all classes.
   *
   * @return a list of all classes.
   */
  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(classesService.getAll());
  }

  /**
   * Deletes a class by its ID.
   *
   * @param idClass the ID of the class to delete.
   * @return a confirmation message.
   */
  @DeleteMapping("/{idClass}")
  public ResponseEntity<String> delete(@PathVariable Long idClass) {
    classesService.deleteClasses(idClass);
    return ResponseEntity.ok("Suppression de la classe confirmée");
  }

  /**
   * Creates a new class.
   *
   * @param classEntityDto the data of the class to create.
   * @return a success message.
   */
  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody ClassEntityDto classEntityDto) {
    System.out.println("udsuvfsgeuvg");
    System.out.println(classEntityDto);
    classesService.save(classEntityDto);
    return ResponseEntity.ok("La classe a été créée avec succès");
  }
}
