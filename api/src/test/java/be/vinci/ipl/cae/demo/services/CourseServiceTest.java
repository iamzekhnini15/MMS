package be.vinci.ipl.cae.demo.services;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class CourseServiceTest {

  private CourseRepository courseRepository;
  private CourseService courseService;

  @BeforeEach
  void setUp() {
    courseRepository = mock(CourseRepository.class);
    courseService = new CourseService(courseRepository);
  }

  @Test
  void getAll_shouldReturnAllCourses() {
    // Arrange
    Course course1 = new Course();
    Course course2 = new Course();
    List<Course> courses = Arrays.asList(course1, course2);
    when(courseRepository.findAll()).thenReturn(courses);

    // Act
    Iterable<Course> result = courseService.getAll();

    // Assert
    assertThat(result).containsExactly(course1, course2);
    verify(courseRepository, times(1)).findAll();
  }

  @Test
  void save_shouldCallRepositorySave() {
    // Arrange
    Course course = new Course();

    // Act
    courseService.save(course);

    // Assert
    ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);
    verify(courseRepository, times(1)).save(courseCaptor.capture());
    assertThat(courseCaptor.getValue()).isEqualTo(course);
  }

}