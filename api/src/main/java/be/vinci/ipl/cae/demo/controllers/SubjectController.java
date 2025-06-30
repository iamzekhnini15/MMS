package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.FileDto;
import be.vinci.ipl.cae.demo.models.dtos.SubjectDto;
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

/**
 * REST controller managing subject-related endpoints.
 */
@RestController
@RequestMapping("/subject")
@RequiredArgsConstructor
public class SubjectController {

  private final SubjectService subjectService;
  private final FileService fileService;

  /**
   * Retrieves all subjects.
   *
   * @return a ResponseEntity containing the list of all subjects.
   */
  @GetMapping("/getAll")
  public ResponseEntity<?> getAll() {
    return ResponseEntity.ok(subjectService.getAll());
  }

  /**
   * Retrieves all subjects linked to a specific course ID.
   *
   * @param courseId the ID of the course.
   * @return a ResponseEntity containing the list of subjects.
   */
  @GetMapping("/{courseId}")
  public ResponseEntity<?> getStudentsByClassId(@PathVariable Long courseId) {
    List<Subject> subject = subjectService.getSubjectByCourseId(courseId);
    System.out.println(subject);
    return ResponseEntity.ok(subject);
  }

  /**
   * Adds a file to a specific subject.
   *
   * @param subjectId the ID of the subject.
   * @param fileDto the file to add.
   * @return a ResponseEntity containing the added file DTO.
   */
  @PostMapping("/{subjectId}/addFile")
  public ResponseEntity<FileDto> addFileToSubject(@PathVariable Long subjectId,
      @RequestBody FileDto fileDto) {
    System.out.println("Adding file to subject");
    System.out.println(fileDto);
    FileDto savedFileDto = fileService.addFileToSubject(subjectId, fileDto);
    return ResponseEntity.status(201).body(savedFileDto);
  }

  /**
   * Creates a new subject.
   *
   * @param dto the subject DTO to create.
   * @return a ResponseEntity containing the created subject.
   */
  @PostMapping("/create")
  public ResponseEntity<SubjectDto> create(@RequestBody SubjectDto dto) {
    System.out.println(dto);
    SubjectDto createdSubject = subjectService.createSubject(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
  }

}
