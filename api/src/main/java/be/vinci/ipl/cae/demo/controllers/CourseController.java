package be.vinci.ipl.cae.demo.controllers;

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

/**
 * Contrôleur REST pour la gestion des cours.
 * Fournit des endpoints pour récupérer, créer et supprimer des cours.
 */
@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseService courseService;

  /**
   * Récupère la liste de tous les cours.
   *
   * @return une réponse HTTP contenant la liste de tous les cours.
   */
  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(courseService.getAll());
  }

  /**
   * Crée un nouveau cours.
   *
   * @param course le cours à créer.
   * @return une réponse HTTP confirmant la création du cours.
   */
  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody Course course) {
    courseService.save(course);
    return ResponseEntity.ok("Le cours a été créé avec succès");
  }

  /**
   * Supprime un cours en fonction de son identifiant.
   *
   * @param idCourse l'identifiant du cours à supprimer.
   * @return une réponse HTTP confirmant la suppression.
   */
  @DeleteMapping("/delete/{idCourse}")
  public ResponseEntity<String> delete(@PathVariable Long idCourse) {
    courseService.deleteCourse(idCourse);
    return ResponseEntity.ok("Suppression de l'item confirmée");
  }
}
