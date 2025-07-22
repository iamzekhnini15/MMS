package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.BulletinPeriodDto;
import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.services.BulletinPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing bulletin periods.
 */
@RestController
@RequestMapping("/bulletin-periods")
@RequiredArgsConstructor
public class BulletinPeriodController {

  private final BulletinPeriodService bulletinPeriodService;

  /**
   * Get all active bulletin periods.
   *
   * @return list of active periods
   */
  @GetMapping("/active")
  public ResponseEntity<List<BulletinPeriod>> getAllActivePeriods() {
    List<BulletinPeriod> periods = bulletinPeriodService.getAllActivePeriods();
    return ResponseEntity.ok(periods);
  }

  /**
   * Get periods by academic year.
   *
   * @param academicYear the academic year
   * @return list of periods
   */
  @GetMapping("/year/{academicYear}")
  public ResponseEntity<List<BulletinPeriod>> getPeriodsByYear(@PathVariable String academicYear) {
    List<BulletinPeriod> periods = bulletinPeriodService.getPeriodsByAcademicYear(academicYear);
    return ResponseEntity.ok(periods);
  }

  /**
   * Get current active period.
   *
   * @return current period if found
   */
  @GetMapping("/current")
  public ResponseEntity<BulletinPeriod> getCurrentPeriod() {
    Optional<BulletinPeriod> currentPeriod = bulletinPeriodService.getCurrentPeriod();
    return currentPeriod.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Get a period by ID.
   *
   * @param id the period ID
   * @return the period if found
   */
  @GetMapping("/{id}")
  public ResponseEntity<BulletinPeriod> getPeriodById(@PathVariable Long id) {
    Optional<BulletinPeriod> period = bulletinPeriodService.getPeriodById(id);
    return period.map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Create a new bulletin period.
   *
   * @param dto the period data
   * @return the created period
   */
  @PostMapping("/create")
  public ResponseEntity<BulletinPeriod> createPeriod(@RequestBody BulletinPeriodDto dto) {
    try {
      BulletinPeriod createdPeriod = bulletinPeriodService.createPeriod(dto);
      return ResponseEntity.status(HttpStatus.CREATED).body(createdPeriod);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Update a bulletin period.
   *
   * @param id the period ID
   * @param dto the updated period data
   * @return the updated period
   */
  @PutMapping("/{id}")
  public ResponseEntity<BulletinPeriod> updatePeriod(@PathVariable Long id, @RequestBody BulletinPeriodDto dto) {
    try {
      Optional<BulletinPeriod> updatedPeriod = bulletinPeriodService.updatePeriod(id, dto);
      return updatedPeriod.map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Delete a bulletin period.
   *
   * @param id the period ID
   * @return success message
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<String> deletePeriod(@PathVariable Long id) {
    try {
      bulletinPeriodService.deletePeriod(id);
      return ResponseEntity.ok("Period deleted successfully");
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Error deleting period: " + e.getMessage());
    }
  }
}
