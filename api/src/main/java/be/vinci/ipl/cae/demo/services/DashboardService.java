package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

  private final UserRepository userRepository;
  private final TeacherRepository teacherRepository;
  private final ClassesRepository classesRepository;

  public Map<String, Long> getKpis() {
    Map<String, Long> kpis = new HashMap<>();
    kpis.put("teachers", teacherRepository.count());
    kpis.put("classes", classesRepository.count());
    return kpis;
  }
}
