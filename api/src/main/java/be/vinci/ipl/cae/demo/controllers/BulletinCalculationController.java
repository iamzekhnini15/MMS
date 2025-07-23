package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.BulletinCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for bulletin calculations and statistics.
 */
@RestController
@RequestMapping("/api/bulletins/calculations")
@RequiredArgsConstructor
public class BulletinCalculationController {

    private final BulletinCalculationService bulletinCalculationService;

    /**
     * Get calculated averages for all students in a class for a specific period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return map of student statistics
     */
    @GetMapping("/class/{classId}/period/{periodId}")
    public ResponseEntity<Map<String, Object>> getClassBulletinStatistics(
            @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            Map<Long, Double> studentAverages = bulletinCalculationService.calculateClassAveragesForPeriod(classId, periodId);
            Double classAverage = bulletinCalculationService.calculateClassAverageForPeriod(classId, periodId);

            Map<String, Object> response = new HashMap<>();
            response.put("studentAverages", studentAverages);
            response.put("classAverage", classAverage);
            response.put("totalStudents", studentAverages.size());

            // Calculate additional statistics
            if (!studentAverages.isEmpty()) {
                double maxGrade = studentAverages.values().stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
                double minGrade = studentAverages.values().stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
                long passCount = studentAverages.values().stream().mapToLong(avg -> avg >= 60 ? 1 : 0).sum();

                response.put("maxGrade", maxGrade);
                response.put("minGrade", minGrade);
                response.put("passCount", passCount);
                response.put("passRate", (double) passCount / studentAverages.size() * 100);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get calculated average and rank for a specific student.
     *
     * @param studentId the student ID
     * @param classId the class ID
     * @param periodId the period ID
     * @return student statistics
     */
    @GetMapping("/student/{studentId}/class/{classId}/period/{periodId}")
    public ResponseEntity<Map<String, Object>> getStudentBulletinStatistics(
            @PathVariable Long studentId, @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            Double average = bulletinCalculationService.calculateStudentAverageForPeriod(studentId, periodId);
            Integer rank = bulletinCalculationService.getStudentRankInClass(studentId, classId, periodId);
            Double classAverage = bulletinCalculationService.calculateClassAverageForPeriod(classId, periodId);

            Map<String, Object> response = new HashMap<>();
            response.put("average", average);
            response.put("rank", rank);
            response.put("classAverage", classAverage);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get detailed bulletin for a specific student with subject averages.
     *
     * @param studentId the student ID
     * @param classId the class ID
     * @param periodId the period ID
     * @return detailed bulletin with subject averages
     */
    @GetMapping("/bulletin/student/{studentId}/class/{classId}/period/{periodId}")
    public ResponseEntity<Map<String, Object>> getStudentDetailedBulletin(
            @PathVariable Long studentId, @PathVariable Long classId, @PathVariable Long periodId) {
        try {
            Double overallAverage = bulletinCalculationService.calculateStudentAverageForPeriod(studentId, periodId);
            Integer rank = bulletinCalculationService.getStudentRankInClass(studentId, classId, periodId);
            Double classAverage = bulletinCalculationService.calculateClassAverageForPeriod(classId, periodId);
            Map<Long, Double> subjectAverages = bulletinCalculationService.getStudentSubjectAveragesForPeriod(studentId, periodId);

            Map<String, Object> response = new HashMap<>();
            response.put("overallAverage", overallAverage);
            response.put("rank", rank);
            response.put("classAverage", classAverage);
            response.put("subjectAverages", subjectAverages);
            response.put("hasGrades", !subjectAverages.isEmpty());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
