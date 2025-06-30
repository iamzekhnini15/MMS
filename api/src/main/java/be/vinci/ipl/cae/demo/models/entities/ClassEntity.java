package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Entity representing a class in the system.
 */
@Entity
@Table(name = "classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClassEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idClass;

  @Column(nullable = false, unique = true)
  private String name;

  @Column(nullable = false)
  private String level;

  private String department;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idResponsibleTeacher")
  private Teacher responsibleTeacher;

  @OneToMany(mappedBy = "classEntity", fetch = FetchType.LAZY)
  @JsonIgnoreProperties("classEntity") // Ignore classEntity dans Student
  private List<Student> students;

}
