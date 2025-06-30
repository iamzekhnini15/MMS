package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ClassEntityDTO;
import be.vinci.ipl.cae.demo.models.dtos.StudentDTO;
import be.vinci.ipl.cae.demo.services.ClassesService;
import java.util.List;
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
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassesController {

  private final ClassesService classesService;

  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(classesService.getAll());
  }

  @DeleteMapping("/{idClass}")
  public ResponseEntity<String> delete(@PathVariable Long idClass) {
    classesService.deleteClasses(idClass);
    return ResponseEntity.ok("Suppression de la classe confirmée");
  }

  @PostMapping("/create")
  public ResponseEntity<String> create(@RequestBody ClassEntityDTO classEntityDTO) {
    System.out.println("udsuvfsgeuvg");
    System.out.println(classEntityDTO);
    classesService.save(classEntityDTO);
    return ResponseEntity.ok("La classe a été créée avec succès");
  }

}

