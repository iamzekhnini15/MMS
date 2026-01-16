package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.*;
import be.vinci.ipl.cae.demo.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimetableGeneratorServiceTest {

    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private TeacherAvailabilityRepository teacherAvailabilityRepository;
    @Mock
    private ClassroomAvailabilityRepository classroomAvailabilityRepository;
    @Mock
    private TeacherSubjectRepository teacherSubjectRepository;

    @InjectMocks
    private TimetableGeneratorService timetableGeneratorService;

    private Timetable timetable;
    private ClassEntity classEntity;
    private Teacher teacher;
    private Subject subject;
    private Classroom classroom;
    private TimeSlot timeSlot;
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

    @BeforeEach
    void setUp() throws ParseException {
        // Setup test data
        timetable = new Timetable();
        timetable.setIdTimetable(1L);
        timetable.setName("Test Timetable");
        
        classEntity = new ClassEntity();
        classEntity.setIdClass(1L);
        classEntity.setName("6ème A");
        classEntity.setLevel("6ème");
        
        teacher = new Teacher();
        teacher.setIdTeacher(1L);
        teacher.setName("Dupont");
        teacher.setEmail("dupont@school.com");
        
        subject = new Subject();
        subject.setIdSubject(1L);
        subject.setName("Mathématiques");
        
        classroom = new Classroom();
        classroom.setIdClassroom(1L);
        classroom.setName("Salle A101");
        
        timeSlot = new TimeSlot();
        timeSlot.setIdTimeSlot(1L);
        timeSlot.setDayOfWeek(DayOfWeek.MONDAY);
        timeSlot.setStartTime(timeFormat.parse("08:00"));
        timeSlot.setEndTime(timeFormat.parse("10:00"));
        timeSlot.setName("Lundi 8h-10h");
    }

    @Test
    void isTeacherAvailable_WhenNoAvailabilitySet_ShouldReturnTrue() {
        // Given - no specific availability = available all time
        when(teacherAvailabilityRepository.findByTeacherAndDayOfWeek(teacher, DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList());

        // When
        boolean result = timetableGeneratorService.isTeacherAvailable(teacher, timeSlot);

        // Then
        assertTrue(result, "Teacher should be available when no specific availability is set");
        verify(teacherAvailabilityRepository).findByTeacherAndDayOfWeek(teacher, DayOfWeek.MONDAY);
    }

    @Test
    void isTeacherAvailable_WhenAvailableInTimeSlot_ShouldReturnTrue() throws ParseException {
        // Given
        TeacherAvailability availability = createTeacherAvailability();
        when(teacherAvailabilityRepository.findByTeacherAndDayOfWeek(teacher, DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList(availability));

        // When
        boolean result = timetableGeneratorService.isTeacherAvailable(teacher, timeSlot);

        // Then
        assertTrue(result, "Teacher should be available during defined availability period");
        verify(teacherAvailabilityRepository).findByTeacherAndDayOfWeek(teacher, DayOfWeek.MONDAY);
    }

    @Test
    void isClassroomAvailable_WhenNoAvailabilitySet_ShouldReturnTrue() {
        // Given - no specific availability = available all time
        when(classroomAvailabilityRepository.findByClassroomAndDayOfWeek(classroom, DayOfWeek.MONDAY))
                .thenReturn(Arrays.asList());

        // When
        boolean result = timetableGeneratorService.isClassroomAvailable(classroom, timeSlot);

        // Then
        assertTrue(result, "Classroom should be available when no specific availability is set");
        verify(classroomAvailabilityRepository).findByClassroomAndDayOfWeek(classroom, DayOfWeek.MONDAY);
    }

    @Test
    void hasConflicts_WhenNoConflicts_ShouldReturnFalse() {
        // Given
        TimetableEntry entry = createTimetableEntry();
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndTeacher(timetable, timeSlot, teacher))
                .thenReturn(false);
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndClassroom(timetable, timeSlot, classroom))
                .thenReturn(false);
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndClassEntity(timetable, timeSlot, classEntity))
                .thenReturn(false);

        // When
        boolean result = timetableGeneratorService.hasConflicts(entry);

        // Then
        assertFalse(result, "Should return false when no conflicts exist");
        verify(timetableEntryRepository).existsByTimetableAndTimeSlotAndTeacher(timetable, timeSlot, teacher);
        verify(timetableEntryRepository).existsByTimetableAndTimeSlotAndClassroom(timetable, timeSlot, classroom);
        verify(timetableEntryRepository).existsByTimetableAndTimeSlotAndClassEntity(timetable, timeSlot, classEntity);
    }

    @Test
    void hasConflicts_WhenTeacherConflict_ShouldReturnTrue() {
        // Given
        TimetableEntry entry = createTimetableEntry();
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndTeacher(timetable, timeSlot, teacher))
                .thenReturn(true);

        // When
        boolean result = timetableGeneratorService.hasConflicts(entry);

        // Then
        assertTrue(result, "Should return true when teacher conflict exists");
        verify(timetableEntryRepository).existsByTimetableAndTimeSlotAndTeacher(timetable, timeSlot, teacher);
    }

    @Test
    void hasConflicts_WhenClassroomConflict_ShouldReturnTrue() {
        // Given
        TimetableEntry entry = createTimetableEntry();
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndTeacher(timetable, timeSlot, teacher))
                .thenReturn(false);
        when(timetableEntryRepository.existsByTimetableAndTimeSlotAndClassroom(timetable, timeSlot, classroom))
                .thenReturn(true);

        // When
        boolean result = timetableGeneratorService.hasConflicts(entry);

        // Then
        assertTrue(result, "Should return true when classroom conflict exists");
        verify(timetableEntryRepository).existsByTimetableAndTimeSlotAndClassroom(timetable, timeSlot, classroom);
    }

    private TeacherAvailability createTeacherAvailability() throws ParseException {
        TeacherAvailability availability = new TeacherAvailability();
        availability.setIdTeacherAvailability(1L);
        availability.setTeacher(teacher);
        availability.setDayOfWeek(DayOfWeek.MONDAY);
        availability.setStartTime(timeFormat.parse("08:00"));
        availability.setEndTime(timeFormat.parse("12:00"));
        return availability;
    }

    private ClassroomAvailability createClassroomAvailability() throws ParseException {
        ClassroomAvailability availability = new ClassroomAvailability();
        availability.setIdClassroomAvailability(1L);
        availability.setClassroom(classroom);
        availability.setDayOfWeek(DayOfWeek.MONDAY);
        availability.setStartTime(timeFormat.parse("08:00"));
        availability.setEndTime(timeFormat.parse("17:00"));
        return availability;
    }

    private TimetableEntry createTimetableEntry() {
        TimetableEntry entry = new TimetableEntry();
        entry.setIdTimetableEntry(1L);
        entry.setTimetable(timetable);
        entry.setClassEntity(classEntity);
        entry.setSubject(subject);
        entry.setTeacher(teacher);
        entry.setClassroom(classroom);
        entry.setTimeSlot(timeSlot);
        return entry;
    }
}
