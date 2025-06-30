package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

/**
 * Entity representing a student's bulletin containing trimester results.
 */
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bulletin {

  @Id
  @GeneratedValue
  private Long id;

  @ManyToOne
  private Student student;

  private int trimester;

  private double average;

  private String appreciation;

}
