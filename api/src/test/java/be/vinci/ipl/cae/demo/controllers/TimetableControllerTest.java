package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.TimetableService;
import be.vinci.ipl.cae.demo.services.TimeSlotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TimetableController.class)
class TimetableControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TimetableService timetableService;

    @MockBean
    private TimeSlotService timeSlotService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Mock methods that don't require complex setup
        when(timetableService.getAllTimetables()).thenReturn(Arrays.asList());
        when(timeSlotService.getAllTimeSlots()).thenReturn(Arrays.asList());
    }

    @Test
    void getAllTimetables_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/timetables"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getAllTimeSlots_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/timetables/time-slots"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void initializeTimeSlots_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/timetables/time-slots/init"))
                .andExpect(status().isOk());
    }

    @Test
    void generateTimetable_WithValidRequest_ShouldReturnOk() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("classId", 1L);
        request.put("startDate", "2025-09-08");
        request.put("endDate", "2025-12-20");
        request.put("subjectHours", Map.of("1", 4, "2", 3));

        // When & Then
        mockMvc.perform(post("/api/timetables/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getTimetableEntries_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/timetables/1/entries"))
                .andExpect(status().isOk());
    }

    @Test
    void publishTimetable_ShouldReturnOk() throws Exception {
        mockMvc.perform(put("/api/timetables/1/publish"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteTimetable_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/timetables/1"))
                .andExpect(status().isNoContent());
    }
}
