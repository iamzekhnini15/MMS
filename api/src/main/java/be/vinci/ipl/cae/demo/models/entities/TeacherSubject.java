package be.vinci.ipl.cae.demo.models.entities;


import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a subject for a specific teacher.
 */
@Entity
@Table(name = "teacher_subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TeacherSubjectId.class)
public class TeacherSubject {
  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idTeacher", nullable = false)
  private Teacher teacher;

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "idSubject", nullable = false)
  private Subject subject;
}
