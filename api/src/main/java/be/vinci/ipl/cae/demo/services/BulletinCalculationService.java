package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.EvaluationGrade;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.EvaluationGradeRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for calculating bulletin statistics and grades.
 */
@Service
@RequiredArgsConstructor
public class BulletinCalculationService {

    private final EvaluationGradeRepository evaluationGradeRepository;
    private final StudentRepository studentRepository;

    /**
     * Calculate the average grade for a student in a specific period.
     * This calculates the average by subject first, then calculates the overall average.
     * Example: Student has Math (18/20), Chemistry (16/20), Physics (19/20)
     * Result: Math=90%, Chemistry=80%, Physics=95% => Overall=(90+80+95)/3 = 88.33%
     *
     * @param studentId the student ID
     * @param periodId the period ID
     * @return the calculated average (0-100 scale) or null if no grades found
     */
    public Double calculateStudentAverageForPeriod(Long studentId, Long periodId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return null;
        }

        // Get all grades for this student in this period across all subjects
        List<EvaluationGrade> grades = evaluationGradeRepository.findAll().stream()
                .filter(grade -> grade.getStudent().getIdStudent().equals(studentId) &&
                        grade.getEvaluation().getBulletinPeriod().getIdPeriod().equals(periodId) &&
                        grade.getIncludeInCalculation() &&
                        grade.getStatus() == EvaluationGrade.GradeStatus.PRESENT)
                .collect(Collectors.toList());

        if (grades.isEmpty()) {
            return null;
        }

        // Group grades by subject to calculate average per subject
        Map<Long, List<EvaluationGrade>> gradesBySubject = grades.stream()
                .collect(Collectors.groupingBy(grade -> grade.getEvaluation().getSubject().getIdSubject()));

        if (gradesBySubject.isEmpty()) {
            return null;
        }

        // Calculate average for each subject
        double totalSubjectAverages = 0.0;
        int subjectCount = 0;

        for (Map.Entry<Long, List<EvaluationGrade>> entry : gradesBySubject.entrySet()) {
            List<EvaluationGrade> subjectGrades = entry.getValue();
            
            // Calculate average for this subject
            double subjectTotalScore = 0.0;
            double subjectTotalMaxScore = 0.0;
            
            for (EvaluationGrade grade : subjectGrades) {
                subjectTotalScore += grade.getScore();
                subjectTotalMaxScore += grade.getEvaluation().getMaxScore();
            }
            
            if (subjectTotalMaxScore > 0) {
                // Calculate subject average as percentage (0-100)
                double subjectAverage = (subjectTotalScore / subjectTotalMaxScore) * 100.0;
                totalSubjectAverages += subjectAverage;
                subjectCount++;
            }
        }

        if (subjectCount == 0) {
            return null;
        }

        // Calculate overall average (simple arithmetic mean of subject averages)
        return totalSubjectAverages / subjectCount;
    }

    /**
     * Calculate statistics for all students in a class for a specific period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return map of student ID to their calculated average
     */
    public Map<Long, Double> calculateClassAveragesForPeriod(Long classId, Long periodId) {
        List<Student> studentsInClass = studentRepository.findByClassEntityIdClass(classId);
        
        return studentsInClass.stream()
                .collect(Collectors.toMap(
                        Student::getIdStudent,
                        student -> calculateStudentAverageForPeriod(student.getIdStudent(), periodId)
                ))
                .entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                ));
    }

    /**
     * Calculate class average for a period.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @return the class average or null if no data
     */
    public Double calculateClassAverageForPeriod(Long classId, Long periodId) {
        Map<Long, Double> studentAverages = calculateClassAveragesForPeriod(classId, periodId);
        
        if (studentAverages.isEmpty()) {
            return null;
        }

        return studentAverages.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    /**
     * Get student rank in class for a specific period.
     *
     * @param studentId the student ID
     * @param classId the class ID
     * @param periodId the period ID
     * @return the rank (1-based) or null if no data
     */
    public Integer getStudentRankInClass(Long studentId, Long classId, Long periodId) {
        Map<Long, Double> classAverages = calculateClassAveragesForPeriod(classId, periodId);
        Double studentAverage = classAverages.get(studentId);
        
        if (studentAverage == null) {
            return null;
        }

        // Count how many students have a higher average
        long studentsWithHigherAverage = classAverages.values().stream()
                .mapToDouble(Double::doubleValue)
                .filter(avg -> avg > studentAverage)
                .count();

        return (int) (studentsWithHigherAverage + 1);
    }

    /**
     * Get detailed subject averages for a student in a specific period.
     * This returns the average for each subject separately.
     *
     * @param studentId the student ID
     * @param periodId the period ID
     * @return map of subject ID to average grade
     */
    public Map<Long, Double> getStudentSubjectAveragesForPeriod(Long studentId, Long periodId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            return Map.of();
        }

        // Get all grades for this student in this period across all subjects
        List<EvaluationGrade> grades = evaluationGradeRepository.findAll().stream()
                .filter(grade -> grade.getStudent().getIdStudent().equals(studentId) &&
                        grade.getEvaluation().getBulletinPeriod().getIdPeriod().equals(periodId) &&
                        grade.getIncludeInCalculation() &&
                        grade.getStatus() == EvaluationGrade.GradeStatus.PRESENT)
                .collect(Collectors.toList());

        if (grades.isEmpty()) {
            return Map.of();
        }

        // Group grades by subject to calculate average per subject
        Map<Long, List<EvaluationGrade>> gradesBySubject = grades.stream()
                .collect(Collectors.groupingBy(grade -> grade.getEvaluation().getSubject().getIdSubject()));

        Map<Long, Double> subjectAverages = new HashMap<>();

        for (Map.Entry<Long, List<EvaluationGrade>> entry : gradesBySubject.entrySet()) {
            Long subjectId = entry.getKey();
            List<EvaluationGrade> subjectGrades = entry.getValue();
            
            // Calculate average for this subject
            double subjectTotalScore = 0.0;
            double subjectTotalMaxScore = 0.0;
            
            for (EvaluationGrade grade : subjectGrades) {
                subjectTotalScore += grade.getScore();
                subjectTotalMaxScore += grade.getEvaluation().getMaxScore();
            }
            
            if (subjectTotalMaxScore > 0) {
                // Calculate subject average as percentage (0-100)
                double subjectAverage = (subjectTotalScore / subjectTotalMaxScore) * 100.0;
                subjectAverages.put(subjectId, subjectAverage);
            }
        }

        return subjectAverages;
    }
}
