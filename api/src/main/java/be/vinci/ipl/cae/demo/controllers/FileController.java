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

@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

  private final FileService fileService;

  @GetMapping("/getAll")
  public ResponseEntity<List<File>> getAllFiles() {
    List<File> files = fileService.getAllFiles();
    return ResponseEntity.ok(files);
  }

  @GetMapping("/subject/{subjectId}")
  public ResponseEntity<List<File>> getFilesBySubject(@PathVariable("subjectId") Long subjectId) {
    List<File> files = fileService.getFileBySubject(subjectId);
    return ResponseEntity.ok(files);
  }

  @PatchMapping("/{fileId}/toggleVisibility")
  public ResponseEntity<File> toggleVisibility(@PathVariable("fileId") Long fileId) {
    File updatedFile = fileService.toogleVisibility(fileId);
    return ResponseEntity.ok(updatedFile); // On retourne le fichier modifié
  }


}
