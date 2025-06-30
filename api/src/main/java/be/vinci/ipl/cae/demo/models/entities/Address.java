package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing an address. This class is mapped to the "adresses" table in the database.
 */
@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Address {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idAddress;

  @Column(nullable = false)
  private String street;

  @Column(nullable = false)
  private String number;

  @Column(nullable = true)
  private String box;

  @Column(nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String commune;

  @Column(nullable = false)
  private String country;
}
