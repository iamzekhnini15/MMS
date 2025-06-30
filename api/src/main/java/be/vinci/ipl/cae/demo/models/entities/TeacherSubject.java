package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.*;
import lombok.*;

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
