package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.repositories.TeacherAvailabilityRepository;
import be.vinci.ipl.cae.demo.repositories.ClassroomAvailabilityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AvailabilityController.class)
class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeacherAvailabilityRepository teacherAvailabilityRepository;

    @MockBean
    private ClassroomAvailabilityRepository classroomAvailabilityRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createTeacherAvailability_WithValidData_ShouldReturnCreated() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("teacherId", 1L);
        request.put("dayOfWeek", "MONDAY");
        request.put("startTime", "08:00");
        request.put("endTime", "12:00");

        // When & Then
        mockMvc.perform(post("/api/availabilities/teachers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void createClassroomAvailability_WithValidData_ShouldReturnCreated() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("classroomId", 1L);
        request.put("dayOfWeek", "MONDAY");
        request.put("startTime", "08:00");
        request.put("endTime", "17:00");

        // When & Then
        mockMvc.perform(post("/api/availabilities/classrooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void getTeacherAvailabilities_ShouldReturnOk() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/availabilities/teachers/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getClassroomAvailabilities_ShouldReturnOk() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/availabilities/classrooms/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void deleteTeacherAvailability_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/availabilities/teachers/1/MONDAY/08:00"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteClassroomAvailability_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/availabilities/classrooms/1/MONDAY/08:00"))
                .andExpect(status().isNoContent());
    }
}
