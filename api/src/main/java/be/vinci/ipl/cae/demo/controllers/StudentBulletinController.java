package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.StudentBulletinDto;
import be.vinci.ipl.cae.demo.models.entities.StudentBulletin;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.StudentBulletinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing student bulletins.
 */
@RestController
@RequestMapping("/bulletins")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentBulletinController {

    private final StudentBulletinService studentBulletinService;

    /**
     * Generate bulletins for all students in a class and period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return list of generated bulletins
     */
    @PostMapping("/generate/class/{classId}/period/{periodId}")
    public ResponseEntity<List<StudentBulletin>> generateBulletinsForClass(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            // TODO: Get the current user from authentication context
            // For now, create a temporary user
            User tempUser = new User();
            tempUser.setIdUser(1L);
            tempUser.setFirstname("Admin");
            tempUser.setLastname("System");
            
            List<StudentBulletin> bulletins = studentBulletinService.generateBulletinsForClass(classId, periodId, tempUser);
            return ResponseEntity.ok(bulletins);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all bulletins for a specific class and period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return list of bulletins
     */
    @GetMapping("/class/{classId}/period/{periodId}")
    public ResponseEntity<List<StudentBulletin>> getBulletinsByClassAndPeriod(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            List<StudentBulletin> bulletins = studentBulletinService.getBulletinsByClassAndPeriod(classId, periodId);
            return ResponseEntity.ok(bulletins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get bulletin by student and period.
     *
     * @param studentId the student ID
     * @param periodId the period ID
     * @return the bulletin if found
     */
    @GetMapping("/student/{studentId}/period/{periodId}")
    public ResponseEntity<StudentBulletin> getBulletinByStudentAndPeriod(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        try {
            return studentBulletinService.getBulletinByStudentAndPeriod(studentId, periodId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update bulletin comment.
     *
     * @param bulletinId the bulletin ID
     * @param comment the new comment
     * @return the updated bulletin
     */
    @PutMapping("/{bulletinId}/comment")
    public ResponseEntity<StudentBulletin> updateBulletinComment(
            @PathVariable Long bulletinId,
            @RequestParam String comment) {
        try {
            StudentBulletin bulletin = studentBulletinService.updateBulletinComment(bulletinId, comment);
            return ResponseEntity.ok(bulletin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Toggle bulletin visibility.
     *
     * @param bulletinId the bulletin ID
     * @return the updated bulletin
     */
    @PutMapping("/{bulletinId}/visibility")
    public ResponseEntity<StudentBulletin> toggleBulletinVisibility(@PathVariable Long bulletinId) {
        try {
            StudentBulletin bulletin = studentBulletinService.toggleBulletinVisibility(bulletinId);
            return ResponseEntity.ok(bulletin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Make all bulletins visible for a class and period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return list of updated bulletins
     */
    @PutMapping("/make-visible/class/{classId}/period/{periodId}")
    public ResponseEntity<List<StudentBulletin>> makeAllBulletinsVisible(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            List<StudentBulletin> bulletins = studentBulletinService.makeAllBulletinsVisible(classId, periodId);
            return ResponseEntity.ok(bulletins);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Hide all bulletins for a class and period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return list of updated bulletins
     */
    @PutMapping("/hide-all/class/{classId}/period/{periodId}")
    public ResponseEntity<List<StudentBulletin>> hideAllBulletins(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            List<StudentBulletin> bulletins = studentBulletinService.hideAllBulletins(classId, periodId);
            return ResponseEntity.ok(bulletins);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check if bulletins exist for a class and period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return true if bulletins exist
     */
    @GetMapping("/exists/class/{classId}/period/{periodId}")
    public ResponseEntity<Boolean> bulletinsExist(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            boolean exist = studentBulletinService.bulletinsExistForClassAndPeriod(classId, periodId);
            return ResponseEntity.ok(exist);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed bulletin with subject grades for a student and period.
     *
     * @param studentId the student ID
     * @param periodId the period ID
     * @return detailed bulletin with subject grades
     */
    @GetMapping("/detailed/student/{studentId}/period/{periodId}")
    public ResponseEntity<StudentBulletinDto> getDetailedBulletin(
            @PathVariable Long studentId, @PathVariable Long periodId) {
        try {
            return studentBulletinService.getDetailedBulletin(studentId, periodId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all visible bulletins for a student by user ID.
     *
     * @param userId the user ID
     * @return list of visible bulletins for the student
     */
    @GetMapping("/student/user/{userId}/visible")
    public ResponseEntity<List<StudentBulletin>> getVisibleBulletinsByUserId(@PathVariable Long userId) {
        try {
            List<StudentBulletin> bulletins = studentBulletinService.getVisibleBulletinsByUserId(userId);
            return ResponseEntity.ok(bulletins);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
