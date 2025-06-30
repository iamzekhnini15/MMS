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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Représente un fichier associé à une matière dans le système.
 * Chaque fichier a un nom, une URL d'accès et une visibilité.
 */
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
