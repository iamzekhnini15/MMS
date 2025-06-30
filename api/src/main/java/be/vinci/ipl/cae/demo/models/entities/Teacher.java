package be.vinci.ipl.cae.demo.models.entities;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Teacher {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idTeacher;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idUser", nullable = false, unique = true)
  private User user;

  private String specialities;

  private String contractType;

  private Boolean isFullTime;

  private String availability;
}
