package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.File;
import be.vinci.ipl.cae.demo.services.FileService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour la gestion des fichiers.
 * Fournit des endpoints pour récupérer les fichiers et modifier leur visibilité.
 */
@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

  private final FileService fileService;

  /**
   * Récupère la liste de tous les fichiers.
   *
   * @return une réponse HTTP contenant la liste de tous les fichiers.
   */
  @GetMapping("/getAll")
  public ResponseEntity<List<File>> getAllFiles() {
    List<File> files = fileService.getAllFiles();
    return ResponseEntity.ok(files);
  }

  /**
   * Récupère la liste des fichiers associés à une matière spécifique.
   *
   * @param subjectId l'identifiant de la matière.
   * @return une réponse HTTP contenant la liste des fichiers pour cette matière.
   */
  @GetMapping("/subject/{subjectId}")
  public ResponseEntity<List<File>> getFilesBySubject(@PathVariable("subjectId") Long subjectId) {
    List<File> files = fileService.getFileBySubject(subjectId);
    return ResponseEntity.ok(files);
  }

  /**
   * Change la visibilité d'un fichier (visible/invisible).
   *
   * @param fileId l'identifiant du fichier à modifier.
   * @return une réponse HTTP contenant le fichier mis à jour.
   */
  @PatchMapping("/{fileId}/toggleVisibility")
  public ResponseEntity<File> toggleVisibility(@PathVariable("fileId") Long fileId) {
    File updatedFile = fileService.toogleVisibility(fileId);
    return ResponseEntity.ok(updatedFile);
  }
}

