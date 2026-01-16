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
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimeSlotServiceTest {

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @InjectMocks
    private TimeSlotService timeSlotService;

    private TimeSlot timeSlot;
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

    @BeforeEach
    void setUp() throws ParseException {
        timeSlot = new TimeSlot();
        timeSlot.setIdTimeSlot(1L);
        timeSlot.setDayOfWeek(DayOfWeek.MONDAY);
        timeSlot.setStartTime(timeFormat.parse("08:00"));
        timeSlot.setEndTime(timeFormat.parse("10:00"));
        timeSlot.setName("Lundi 8h-10h");
        timeSlot.setDescription("Période du matin");
    }

    @Test
    void getAllTimeSlots_ShouldReturnAllTimeSlots() {
        // Given
        List<TimeSlot> expectedTimeSlots = Arrays.asList(timeSlot);
        when(timeSlotRepository.findAllByOrderByDayOfWeekAscStartTimeAsc()).thenReturn(expectedTimeSlots);

        // When
        List<TimeSlot> actualTimeSlots = timeSlotService.getAllTimeSlots();

        // Then
        assertEquals(expectedTimeSlots, actualTimeSlots);
        verify(timeSlotRepository).findAllByOrderByDayOfWeekAscStartTimeAsc();
    }

    @Test
    void getTimeSlotsForDay_ShouldReturnTimeSlotsForDay() {
        // Given
        List<TimeSlot> expectedTimeSlots = Arrays.asList(timeSlot);
        when(timeSlotRepository.findByDayOfWeekOrderByStartTime(DayOfWeek.MONDAY))
                .thenReturn(expectedTimeSlots);

        // When
        List<TimeSlot> result = timeSlotService.getTimeSlotsForDay(DayOfWeek.MONDAY);

        // Then
        assertEquals(expectedTimeSlots, result);
        verify(timeSlotRepository).findByDayOfWeekOrderByStartTime(DayOfWeek.MONDAY);
    }

    @Test
    void createTimeSlot_ShouldCreateAndReturnTimeSlot() {
        // Given
        when(timeSlotRepository.save(any(TimeSlot.class))).thenReturn(timeSlot);

        // When
        TimeSlot result = timeSlotService.createTimeSlot(
                DayOfWeek.MONDAY, 
                "08:00", 
                "10:00", 
                "Lundi 8h-10h", 
                "Période du matin"
        );

        // Then
        assertEquals(timeSlot, result);
        verify(timeSlotRepository).save(any(TimeSlot.class));
    }

    @Test
    void createTimeSlot_WithInvalidTimeFormat_ShouldThrowException() {
        // When & Then
        assertThrows(RuntimeException.class, () -> {
            timeSlotService.createTimeSlot(
                    DayOfWeek.MONDAY, 
                    "invalid-time", 
                    "10:00", 
                    "Test", 
                    "Test"
            );
        });
    }

    @Test
    void initializeDefaultTimeSlots_ShouldCreateDefaultSlots() {
        // Given
        when(timeSlotRepository.count()).thenReturn(0L);
        when(timeSlotRepository.saveAll(any())).thenReturn(Arrays.asList());

        // When
        timeSlotService.initializeDefaultTimeSlots();

        // Then
        verify(timeSlotRepository).count();
        verify(timeSlotRepository).saveAll(any());
    }

    @Test
    void initializeDefaultTimeSlots_WhenSlotsExist_ShouldNotCreateNew() {
        // Given
        when(timeSlotRepository.count()).thenReturn(10L);

        // When
        timeSlotService.initializeDefaultTimeSlots();

        // Then
        verify(timeSlotRepository).count();
        verify(timeSlotRepository, never()).saveAll(any());
    }
}
