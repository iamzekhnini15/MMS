package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

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

  public enum Role {
    ADMIN,
    STUDENT,
    DIRECTOR,
    TEACHER
  }
}
