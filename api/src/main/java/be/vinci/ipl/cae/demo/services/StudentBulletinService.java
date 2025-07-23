package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.EvaluationGradeDto;
import be.vinci.ipl.cae.demo.models.dtos.StudentBulletinDto;
import be.vinci.ipl.cae.demo.models.entities.*;
import be.vinci.ipl.cae.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating and managing student bulletins.
 */
@Service
@RequiredArgsConstructor
public class StudentBulletinService {

    private final StudentBulletinRepository studentBulletinRepository;
    private final BulletinCalculationService bulletinCalculationService;
    private final StudentRepository studentRepository;
    private final BulletinPeriodRepository bulletinPeriodRepository;
    private final ClassesRepository classesRepository;
    private final EvaluationGradeRepository evaluationGradeRepository;
    private final SubjectCoefficientService subjectCoefficientService;

    /**
     * Generate bulletins for all students in a class for a specific period.
     * This creates StudentBulletin entities with real calculated grades.
     *
     * @param classId the class ID
     * @param periodId the period ID
     * @param generatedBy the user who generates the bulletins
     * @return list of generated bulletins
     */
    @Transactional
    public List<StudentBulletin> generateBulletinsForClass(Long classId, Long periodId, User generatedBy) {
        // Verify class and period exist
        classesRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Classe non trouvée: " + classId));
        BulletinPeriod period = bulletinPeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Période non trouvée: " + periodId));

        // Get all students in the class
        List<Student> students = studentRepository.findByClassEntityIdClass(classId);
        if (students.isEmpty()) {
            throw new IllegalArgumentException("Aucun étudiant trouvé dans cette classe");
        }

        // Calculate class statistics
        Map<Long, Double> classStats = bulletinCalculationService.calculateClassAveragesForPeriod(classId, periodId);
        if (classStats == null || classStats.isEmpty()) {
            throw new IllegalArgumentException("Aucune évaluation trouvée pour cette classe et période");
        }

        // Calculate class average
        double classAverage = classStats.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        List<StudentBulletin> generatedBulletins = new ArrayList<>();

        // Generate bulletin for each student
        for (Student student : students) {
            // Check if bulletin already exists
            Optional<StudentBulletin> existingBulletin = studentBulletinRepository
                    .findByStudentIdStudentAndBulletinPeriodIdPeriod(student.getIdStudent(), periodId);

            StudentBulletin bulletin;
            if (existingBulletin.isPresent()) {
                // Update existing bulletin
                bulletin = existingBulletin.get();
            } else {
                // Create new bulletin
                bulletin = new StudentBulletin();
                bulletin.setStudent(student);
                bulletin.setBulletinPeriod(period);
                bulletin.setGeneratedBy(generatedBy);
                bulletin.setIsVisible(false); // Hidden by default
            }

            // Calculate student's average
            Double studentAverage = classStats.get(student.getIdStudent());
            if (studentAverage != null) {
                bulletin.setGeneralAverage(studentAverage);
                bulletin.setClassAverage(classAverage);
                bulletin.setTotalStudents(students.size());

                // Calculate rank
                List<Double> sortedAverages = classStats.values()
                        .stream()
                        .sorted(Collections.reverseOrder())
                        .collect(Collectors.toList());
                int rank = sortedAverages.indexOf(studentAverage) + 1;
                bulletin.setClassRank(rank);

                // Generate default comment
                bulletin.setGeneralComment(generateDefaultComment(studentAverage, student));

                // Set PDF path (for future PDF generation)
                bulletin.setPdfFilePath(String.format("/bulletins/%d_%d_%d.pdf", 
                        student.getIdStudent(), classId, periodId));

                bulletin.setGeneratedAt(new Date());

                // Save bulletin
                bulletin = studentBulletinRepository.save(bulletin);
                generatedBulletins.add(bulletin);
            }
        }

        return generatedBulletins;
    }

    /**
     * Get all bulletins for a class and period.
     */
    public List<StudentBulletin> getBulletinsByClassAndPeriod(Long classId, Long periodId) {
        return studentBulletinRepository.findByClassAndPeriod(classId, periodId);
    }

    /**
     * Get bulletin for a specific student and period.
     */
    public Optional<StudentBulletin> getBulletinByStudentAndPeriod(Long studentId, Long periodId) {
        return studentBulletinRepository.findByStudentIdStudentAndBulletinPeriodIdPeriod(studentId, periodId);
    }

    /**
     * Update bulletin comment.
     */
    @Transactional
    public StudentBulletin updateBulletinComment(Long bulletinId, String comment) {
        StudentBulletin bulletin = studentBulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new IllegalArgumentException("Bulletin non trouvé: " + bulletinId));
        
        bulletin.setGeneralComment(comment);
        return studentBulletinRepository.save(bulletin);
    }

    /**
     * Toggle bulletin visibility.
     */
    @Transactional
    public StudentBulletin toggleBulletinVisibility(Long bulletinId) {
        StudentBulletin bulletin = studentBulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new IllegalArgumentException("Bulletin non trouvé: " + bulletinId));
        
        bulletin.setIsVisible(!bulletin.getIsVisible());
        return studentBulletinRepository.save(bulletin);
    }

    /**
     * Make all bulletins visible for a class and period.
     */
    @Transactional
    public List<StudentBulletin> makeAllBulletinsVisible(Long classId, Long periodId) {
        List<StudentBulletin> bulletins = getBulletinsByClassAndPeriod(classId, periodId);
        
        for (StudentBulletin bulletin : bulletins) {
            bulletin.setIsVisible(true);
        }
        
        return studentBulletinRepository.saveAll(bulletins);
    }

    /**
     * Hide all bulletins for a class and period.
     */
    @Transactional
    public List<StudentBulletin> hideAllBulletins(Long classId, Long periodId) {
        List<StudentBulletin> bulletins = getBulletinsByClassAndPeriod(classId, periodId);
        
        for (StudentBulletin bulletin : bulletins) {
            bulletin.setIsVisible(false);
        }
        
        return studentBulletinRepository.saveAll(bulletins);
    }

    /**
     * Generate a default comment based on the student's average.
     */
    private String generateDefaultComment(Double average, Student student) {
        String studentName = student.getUser().getFirstname() + " " + student.getUser().getLastname();
        
        if (average >= 90) {
            return String.format("Excellent travail de %s. Résultats remarquables, continuez ainsi !", studentName);
        } else if (average >= 80) {
            return String.format("Très bon travail de %s. Quelques points à améliorer mais très satisfaisant.", studentName);
        } else if (average >= 70) {
            return String.format("Travail satisfaisant de %s. Des efforts supplémentaires permettraient d'améliorer les résultats.", studentName);
        } else if (average >= 60) {
            return String.format("Travail correct de %s. Il est nécessaire de fournir plus d'efforts pour progresser.", studentName);
        } else {
            return String.format("%s doit fournir des efforts considérables pour améliorer ses résultats. Un suivi particulier est recommandé.", studentName);
        }
    }

    /**
     * Delete a bulletin.
     */
    @Transactional
    public void deleteBulletin(Long bulletinId) {
        studentBulletinRepository.deleteById(bulletinId);
    }

    /**
     * Check if bulletins exist for a class and period.
     */
    public boolean bulletinsExistForClassAndPeriod(Long classId, Long periodId) {
        return !getBulletinsByClassAndPeriod(classId, periodId).isEmpty();
    }

    /**
     * Get detailed bulletin with subject grades for a student and period.
     */
    public Optional<StudentBulletinDto> getDetailedBulletin(Long studentId, Long periodId) {
        // Get the student bulletin
        Optional<StudentBulletin> bulletinOpt = getBulletinByStudentAndPeriod(studentId, periodId);
        if (bulletinOpt.isEmpty()) {
            return Optional.empty();
        }

        StudentBulletin bulletin = bulletinOpt.get();
        Student student = bulletin.getStudent();
        BulletinPeriod period = bulletin.getBulletinPeriod();

        // Get subject grades first to recalculate the real average
        List<StudentBulletinDto.SubjectGradeDto> subjectGrades = getSubjectGradesForStudent(studentId, periodId);
        
        // Recalculate the real general average from actual subject averages
        Double realGeneralAverage = bulletin.getGeneralAverage(); // Default fallback
        if (!subjectGrades.isEmpty()) {
            double totalAverage = subjectGrades.stream()
                    .mapToDouble(StudentBulletinDto.SubjectGradeDto::getAverage)
                    .average()
                    .orElse(bulletin.getGeneralAverage());
            realGeneralAverage = totalAverage;
        }

        // Create the DTO
        StudentBulletinDto dto = new StudentBulletinDto();
        dto.setIdBulletin(bulletin.getIdBulletin());
        dto.setStudentId(student.getIdStudent());
        dto.setStudentName(student.getUser().getFirstname() + " " + student.getUser().getLastname());
        dto.setClassName(student.getClassEntity().getName());
        dto.setPeriodName(period.getName());
        dto.setAcademicYear(period.getAcademicYear());
        dto.setGeneralAverage(realGeneralAverage); // Use recalculated average
        dto.setClassRank(bulletin.getClassRank());
        dto.setTotalStudents(bulletin.getTotalStudents());
        dto.setClassAverage(bulletin.getClassAverage());
        dto.setGeneralComment(bulletin.getGeneralComment());
        dto.setPdfFilePath(bulletin.getPdfFilePath());
        dto.setIsVisible(bulletin.getIsVisible());
        dto.setGeneratedAt(bulletin.getGeneratedAt());

        dto.setSubjectGrades(subjectGrades);

        return Optional.of(dto);
    }

    /**
     * Get subject grades for a student in a specific period.
     */
    private List<StudentBulletinDto.SubjectGradeDto> getSubjectGradesForStudent(Long studentId, Long periodId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        
        // Get all subjects with coefficients for the student's class
        List<SubjectCoefficient> subjectCoefficients = subjectCoefficientService.getCoefficientsByClass(student.getClassEntity().getIdClass());
        
        List<StudentBulletinDto.SubjectGradeDto> subjectGrades = new ArrayList<>();
        
        for (SubjectCoefficient subjectCoeff : subjectCoefficients) {
            Subject subject = subjectCoeff.getSubject();
            
            // Get grades for this subject and period
            List<EvaluationGrade> grades = evaluationGradeRepository.findGradesForCalculation(
                student, subject.getIdSubject(), periodId);
            
            if (!grades.isEmpty()) {
                StudentBulletinDto.SubjectGradeDto subjectGrade = new StudentBulletinDto.SubjectGradeDto();
                subjectGrade.setSubjectName(subject.getName());
                
                // Calculate average for this subject
                double totalScore = 0;
                double totalMaxScore = 0;
                List<EvaluationGradeDto> evaluationGradeDtos = new ArrayList<>();
                
                for (EvaluationGrade grade : grades) {
                    if (grade.getIncludeInCalculation()) {
                        totalScore += grade.getScore();
                        totalMaxScore += grade.getEvaluation().getMaxScore();
                        
                        // Create DTO for each evaluation grade
                        EvaluationGradeDto gradeDto = new EvaluationGradeDto();
                        gradeDto.setIdGrade(grade.getIdGrade());
                        gradeDto.setEvaluationId(grade.getEvaluation().getIdEvaluation());
                        gradeDto.setEvaluationTitle(grade.getEvaluation().getTitle());
                        gradeDto.setMaxScore(grade.getEvaluation().getMaxScore());
                        gradeDto.setStudentId(student.getIdStudent());
                        gradeDto.setStudentName(student.getUser().getFirstname() + " " + student.getUser().getLastname());
                        gradeDto.setScore(grade.getScore());
                        gradeDto.setIncludeInCalculation(grade.getIncludeInCalculation());
                        gradeDto.setStatus(grade.getStatus());
                        gradeDto.setComment(grade.getComment());
                        gradeDto.setGradedAt(grade.getGradedAt());
                        gradeDto.setGradedById(grade.getGradedBy().getIdTeacher());
                        gradeDto.setGradedByName(grade.getGradedBy().getUser().getFirstname() + " " + 
                                               grade.getGradedBy().getUser().getLastname());
                        gradeDto.setPercentage((grade.getScore() / grade.getEvaluation().getMaxScore()) * 100);
                        
                        evaluationGradeDtos.add(gradeDto);
                    }
                }
                
                if (totalMaxScore > 0) {
                    double average = (totalScore / totalMaxScore) * 100; // Convert to percentage (0-100)
                    subjectGrade.setAverage(average);
                    subjectGrade.setCoefficient(subjectCoeff.getCoefficient());
                    subjectGrade.setWeightedAverage(average * subjectGrade.getCoefficient());
                    subjectGrade.setEvaluationGrades(evaluationGradeDtos);
                    
                    subjectGrades.add(subjectGrade);
                }
            }
        }
        
        return subjectGrades;
    }

    /**
     * Get all visible bulletins for a student by user ID.
     *
     * @param userId the user ID
     * @return list of visible bulletins for the student
     */
    public List<StudentBulletin> getVisibleBulletinsByUserId(Long userId) {
        // Find the student by user ID
        Optional<Student> studentOpt = studentRepository.findByUserIdUser(userId);
        if (studentOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        Student student = studentOpt.get();
        
        // Get all bulletins for this student that are visible
        return studentBulletinRepository.findByStudentAndIsVisibleOrderByBulletinPeriodStartDateDesc(
                student, true);
    }
}
