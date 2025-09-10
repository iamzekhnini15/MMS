package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.entities.ClassroomAvailability;
import be.vinci.ipl.cae.demo.models.entities.TeacherAvailability;
import be.vinci.ipl.cae.demo.repositories.ClassroomAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherAvailabilityRepository;
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

/**
 * REST controller for managing availabilities.
 */
@RestController
@RequestMapping("/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

  private final TeacherAvailabilityRepository teacherAvailabilityRepository;
  private final ClassroomAvailabilityRepository classroomAvailabilityRepository;

  /**
   * Get all teacher availabilities.
   *
   * @return list of all teacher availabilities
   */
  @GetMapping("/teacher")
  public ResponseEntity<List<TeacherAvailability>> getAllTeacherAvailabilities() {
    List<TeacherAvailability> availabilities = teacherAvailabilityRepository.findAll();
    return ResponseEntity.ok(availabilities);
  }

  /**
   * Get all classroom availabilities.
   *
   * @return list of all classroom availabilities
   */
  @GetMapping("/classroom")
  public ResponseEntity<List<ClassroomAvailability>> getAllClassroomAvailabilities() {
    List<ClassroomAvailability> availabilities = classroomAvailabilityRepository.findAll();
    return ResponseEntity.ok(availabilities);
  }

  /**
   * Get teacher availabilities.
   *
   * @param teacherId the teacher ID
   * @return list of teacher availabilities
   */
  @GetMapping("/teacher/{teacherId}")
  public ResponseEntity<List<TeacherAvailability>> getTeacherAvailabilities(
      @PathVariable Long teacherId) {
    List<TeacherAvailability> availabilities =
        teacherAvailabilityRepository.findByTeacherIdTeacher(teacherId);
    return ResponseEntity.ok(availabilities);
  }

  /**
   * Get classroom availabilities.
   *
   * @param classroomId the classroom ID
   * @return list of classroom availabilities
   */
  @GetMapping("/classroom/{classroomId}")
  public ResponseEntity<List<ClassroomAvailability>> getClassroomAvailabilities(
      @PathVariable Long classroomId) {
    List<ClassroomAvailability> availabilities =
        classroomAvailabilityRepository.findByClassroomIdClassroom(classroomId);
    return ResponseEntity.ok(availabilities);
  }

  /**
   * Set teacher availability for a time slot.
   *
   * @param availability the teacher availability
   * @return the saved availability
   */
  @PostMapping("/teacher")
  public ResponseEntity<TeacherAvailability> setTeacherAvailability(
      @RequestBody TeacherAvailability availability) {
    TeacherAvailability saved = teacherAvailabilityRepository.save(availability);
    return ResponseEntity.ok(saved);
  }

  /**
   * Set classroom availability for a time slot.
   *
   * @param availability the classroom availability
   * @return the saved availability
   */
  @PostMapping("/classroom")
  public ResponseEntity<ClassroomAvailability> setClassroomAvailability(
      @RequestBody ClassroomAvailability availability) {
    ClassroomAvailability saved = classroomAvailabilityRepository.save(availability);
    return ResponseEntity.ok(saved);
  }

  /**
   * Delete teacher availability.
   *
   * @param id the availability ID
   * @return response entity
   */
  @DeleteMapping("/teacher/{id}")
  public ResponseEntity<Void> deleteTeacherAvailability(@PathVariable Long id) {
    teacherAvailabilityRepository.deleteById(id);
    return ResponseEntity.ok().build();
  }

  /**
   * Delete classroom availability.
   *
   * @param id the availability ID
   * @return response entity
   */
  @DeleteMapping("/classroom/{id}")
  public ResponseEntity<Void> deleteClassroomAvailability(@PathVariable Long id) {
    classroomAvailabilityRepository.deleteById(id);
    return ResponseEntity.ok().build();
  }
}