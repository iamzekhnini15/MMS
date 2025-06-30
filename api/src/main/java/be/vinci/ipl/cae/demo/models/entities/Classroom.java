package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Classroom {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idClassroom;

  @Column(nullable = false, unique = true)
  private String name;

  private String level;

  private Integer capacity;

  private String location;
}
