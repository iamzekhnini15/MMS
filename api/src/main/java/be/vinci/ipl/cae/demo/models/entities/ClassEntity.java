package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;

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
