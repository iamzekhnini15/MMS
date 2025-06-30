package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idCourse;

  @Column(nullable = false, unique = true)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClassroom", nullable = false)
  private Classroom classroom;

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date startDateTime;

  @Temporal(TemporalType.DATE)
  @Column(nullable = false)
  private Date endDateTime;
}
