package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.FileDTO;
import be.vinci.ipl.cae.demo.models.dtos.SubjectDTO;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.services.FileService;
import be.vinci.ipl.cae.demo.services.SubjectService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subject")
@RequiredArgsConstructor
public class SubjectController {

  private final SubjectService subjectService;
  private final FileService fileService;


  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(subjectService.getAll());
  }

  @GetMapping("/{courseId}")
  public ResponseEntity<?> getStudentsByClassId(@PathVariable Long courseId) {
    List<Subject> subject = subjectService.getSubjectByCourseId(courseId);
    System.out.println(subject);
    return ResponseEntity.ok(subject);
  }

  @PostMapping("/{subjectId}/addFile")
  public ResponseEntity<FileDTO> addFileToSubject(@PathVariable Long subjectId,
    @RequestBody FileDTO fileDTO) {
    System.out.println("Adding file to subject");
    System.out.println(fileDTO);
    FileDTO savedFileDTO = fileService.addFileToSubject(subjectId, fileDTO);
    return ResponseEntity.status(201).body(savedFileDTO);
  }


  @PostMapping("/create")
  public ResponseEntity<SubjectDTO> create(@RequestBody SubjectDTO dto) {
    System.out.println(dto);
    SubjectDTO createdSubject = subjectService.createSubject(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
  }

}