package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a student.
 */
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
