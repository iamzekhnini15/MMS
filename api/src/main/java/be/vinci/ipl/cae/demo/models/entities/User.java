package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user in the system.
 * Contains personal, authentication and role-related information.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idUser;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String lastname;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false)
  private String phone;

  @Column(nullable = false)
  private String civility;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(nullable = false)
  private Date registrationDate;

  @Column(nullable = false)
  private Boolean active;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "idAddress", nullable = false)
  private Address address;

  /**
   * Enumeration of possible user roles.
   */
  public enum Role {
    ADMIN,
    STUDENT,
    DIRECTOR,
    TEACHER
  }
}
