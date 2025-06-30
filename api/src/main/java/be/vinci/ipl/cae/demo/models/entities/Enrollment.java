package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enrollment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idEnrollment;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idStudent", nullable = false)
  private Student student;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClass", nullable = false)
  private ClassEntity classEntity;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date enrollmentDate;

  private String status;  // Ex: active, inactive, graduated...
}
