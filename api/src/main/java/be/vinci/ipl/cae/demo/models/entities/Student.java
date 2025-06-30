package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Student {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idStudent;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idUser", nullable = false, unique = true)
  private User user;

  @Temporal(TemporalType.DATE)
  private Date dateOfBirth;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idClass", nullable = false)
  private ClassEntity classEntity;
}
