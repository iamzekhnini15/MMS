package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class File {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idFile;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String url;

  @Column(nullable = false)
  private boolean isVisible;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idSubject", nullable = false)
  private Subject subject;
}
