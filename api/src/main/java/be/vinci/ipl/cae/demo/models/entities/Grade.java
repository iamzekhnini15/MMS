package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Grade {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idGrade;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idStudent", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idCourse", nullable = false)
  private Course course;

  @Column(nullable = false)
  private Double gradeValue;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date evaluationDate;

  private String remarks;
}

