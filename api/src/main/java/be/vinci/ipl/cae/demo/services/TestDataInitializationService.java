package be.vinci.ipl.cae.demo.services;


import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.Classroom;
import be.vinci.ipl.cae.demo.models.entities.Course;
import be.vinci.ipl.cae.demo.models.entities.Student;
import be.vinci.ipl.cae.demo.models.entities.Teacher;
import be.vinci.ipl.cae.demo.models.entities.TimeSlot;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.ClassesRepository;
import be.vinci.ipl.cae.demo.repositories.ClassroomRepository;
import be.vinci.ipl.cae.demo.repositories.CourseRepository;
import be.vinci.ipl.cae.demo.repositories.StudentRepository;
import be.vinci.ipl.cae.demo.repositories.TeacherRepository;
import be.vinci.ipl.cae.demo.repositories.TimeSlotRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service pour initialiser les données de test au démarrage de l'application. Active uniquement en
 * profil staging et dev.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Profile({"staging", "dev"})
@SuppressWarnings("PMD.GuardLogStatement")
public class TestDataInitializationService implements CommandLineRunner {

  private final UserRepository userRepository;
  private final TeacherRepository teacherRepository;
  private final StudentRepository studentRepository;
  private final ClassesRepository classesRepository;
  private final CourseRepository courseRepository;
  private final ClassroomRepository classroomRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final AddressRepository addressRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional
  public void run(String... args) {
    log.info("🚀 Initialisation des données de test...");

    // Vérifier si les données existent déjà
    if (userRepository.count() > 1) { // Plus que l'admin existant
      log.info("✅ Données de test déjà présentes, passage de l'initialisation");
      return;
    }

    try {
      createClassrooms();
      createCourses();
      createClasses();
      createTimeSlots();

      Address defaultAddress = createDefaultAddress();
      createTestUsers(defaultAddress);

      if (log.isInfoEnabled()) {
        log.info("✅ Données de test créées avec succès !");
      }
      logCredentials();
    } catch (Exception e) {
      log.error("❌ Erreur lors de l'initialisation des données de test: {}", e.getMessage(), e);
    }
  }

  private Address createDefaultAddress() {
    log.info("📍 Création de l'adresse par défaut...");

    Address address = new Address();
    address.setStreet("123 Rue de Test");
    address.setNumber("1");
    address.setPostalCode("1000");
    address.setCommune("Bruxelles");
    address.setCountry("Belgique");
    return addressRepository.save(address);
  }

  private void createTestUsers(Address defaultAddress) {
    log.info("👥 Création des utilisateurs de test...");

    // Créer un professeur principal
    User teacherUser = new User();
    teacherUser.setEmail("prof@test.com");
    teacherUser.setFirstname("Jean");
    teacherUser.setLastname("Dupont");
    teacherUser.setPassword(passwordEncoder.encode("prof123"));
    teacherUser.setRole(User.Role.TEACHER);
    teacherUser.setPhone("0123456789");
    teacherUser.setCivility("M.");
    teacherUser.setRegistrationDate(new Date());
    teacherUser.setActive(true);
    teacherUser.setAddress(defaultAddress);
    teacherUser = userRepository.save(teacherUser);

    Teacher teacher = new Teacher();
    teacher.setUser(teacherUser);
    teacher.setSpecialities("Informatique");
    teacher.setContractType("CDI");
    teacher.setIsFullTime(true);
    teacher.setAvailability("Disponible tous les jours");
    teacherRepository.save(teacher);

    // Créer un étudiant
    User studentUser = new User();
    studentUser.setEmail("etudiant@test.com");
    studentUser.setFirstname("Marie");
    studentUser.setLastname("Martin");
    studentUser.setPassword(passwordEncoder.encode("etudiant123"));
    studentUser.setRole(User.Role.STUDENT);
    studentUser.setPhone("0987654321");
    studentUser.setCivility("Mme");
    studentUser.setRegistrationDate(new Date());
    studentUser.setActive(true);
    studentUser.setAddress(defaultAddress);
    studentUser = userRepository.save(studentUser);

    Student student = new Student();
    student.setUser(studentUser);

    // Obtenir une classe existante pour affecter l'étudiant
    Iterable<ClassEntity> classes = classesRepository.findAll();
    ClassEntity defaultClass = null;
    for (ClassEntity clazz : classes) {
      defaultClass = clazz;
    }
    if (defaultClass == null) {
      throw new RuntimeException("Aucune classe trouvée pour affecter l'étudiant");
    }

    student.setClassEntity(defaultClass);
    studentRepository.save(student);

    // Créer d'autres professeurs
    createAdditionalTeachers(defaultAddress);

    log.info(
        "✅ Utilisateurs créés: 1 professeur principal, 1 étudiant, et professeurs additionnels");
  }

  private void createAdditionalTeachers(Address defaultAddress) {
    String[][] teachersData = {
      {"sophie.bernard@test.com", "Sophie", "Bernard", "Mathématiques"},
      {"pierre.dubois@test.com", "Pierre", "Dubois", "Physique"},
      {"laura.garcia@test.com", "Laura", "Garcia", "Anglais"},
      {"thomas.wilson@test.com", "Thomas", "Wilson", "Histoire"},
      {"emma.johnson@test.com", "Emma", "Johnson", "Français"}
    };

    for (String[] teacherData : teachersData) {
      User user = new User();
      user.setEmail(teacherData[0]);
      user.setFirstname(teacherData[1]);
      user.setLastname(teacherData[2]);
      user.setPassword(passwordEncoder.encode("prof123"));
      user.setRole(User.Role.TEACHER);
      user.setPhone("0123456789");
      user.setCivility("M./Mme");
      user.setRegistrationDate(new Date());
      user.setActive(true);
      user.setAddress(defaultAddress);
      user = userRepository.save(user);

      Teacher teacher = new Teacher();
      teacher.setUser(user);
      teacher.setSpecialities(teacherData[3]);
      teacher.setContractType("CDI");
      teacher.setIsFullTime(true);
      teacher.setAvailability("Disponible");
      teacherRepository.save(teacher);
    }
  }

  private void createClassrooms() {
    log.info("🏫 Création des salles de classe...");

    String[][] classroomsData = {
      {"A101", "30"},
      {"A102", "25"},
      {"B201", "100"},
      {"C301", "40"},
      {"C302", "35"},
      {"D401", "20"},
      {"E501", "15"},
      {"F601", "50"}
    };

    for (String[] classroomData : classroomsData) {
      Classroom classroom = new Classroom();
      classroom.setName(classroomData[0]);
      classroom.setCapacity(Integer.parseInt(classroomData[1]));
      classroomRepository.save(classroom);
    }

    log.info("✅ {} salles de classe créées", classroomsData.length);
  }

  private void createCourses() {
    log.info("📚 Création des cours...");

    // Récupérer les enseignants existants
    List<Teacher> teachers = new ArrayList<>();
    teacherRepository.findAll().forEach(teachers::add);
    if (teachers.isEmpty()) {
      log.warn("Aucun enseignant trouvé pour créer les cours");
      return;
    }

    // Récupérer les salles de classe existantes
    List<Classroom> classrooms = new ArrayList<>();
    classroomRepository.findAll().forEach(classrooms::add);
    if (classrooms.isEmpty()) {
      log.warn("Aucune salle de classe trouvée pour créer les cours");
      return;
    }

    String[][] coursesData = {
      {"Programmation Java", "1"},
      {"Base de données", "1"},
      {"Développement Web", "1"},
      {"Mathématiques", "1"},
      {"Anglais technique", "1"},
      {"Algorithmes avancés", "2"},
      {"Sécurité informatique", "2"},
      {"Gestion de projet", "2"},
      {"Intelligence artificielle", "3"},
      {"Architecture logicielle", "3"}
    };

    Random random = new Random();
    for (int i = 0; i < coursesData.length; i++) {
      String[] courseData = coursesData[i];
      Course course = new Course();
      course.setName(courseData[0]);
      course.setLevel(courseData[1]);

      // Assigner un enseignant aléatoire (obligatoire)
      Teacher randomTeacher = teachers.get(random.nextInt(teachers.size()));
      course.setCourseTeacher(randomTeacher);

      // Assigner une salle de classe aléatoire (obligatoire)
      Classroom randomClassroom = classrooms.get(random.nextInt(classrooms.size()));
      course.setCourseClassroom(randomClassroom);

      // Définir des dates de cours (obligatoires)
      Calendar calendar = Calendar.getInstance();
      calendar.add(Calendar.DAY_OF_YEAR, i + 1); // Décaler chaque cours de i+1 jours
      calendar.set(Calendar.HOUR_OF_DAY, 9 + (i % 6)); // Heures entre 9h et 14h
      calendar.set(Calendar.MINUTE, 0);
      calendar.set(Calendar.SECOND, 0);
      course.setStartDateTime(calendar.getTime());

      calendar.add(Calendar.HOUR_OF_DAY, 2); // 2 heures de cours
      course.setEndDateTime(calendar.getTime());

      courseRepository.save(course);
    }

    log.info("✅ {} cours créés", coursesData.length);
  }

  private void createClasses() {
    log.info("🎓 Création des classes...");

    String[][] classesData = {
      {"1BIN1", "1"},
      {"1BIN2", "1"},
      {"2BIN1", "2"},
      {"2BIN2", "2"},
      {"3BIN1", "3"},
      {"3BIN2", "3"}
    };

    for (String[] classData : classesData) {
      ClassEntity classEntity = new ClassEntity();
      classEntity.setName(classData[0]);
      classEntity.setLevel(classData[1]);
      classesRepository.save(classEntity);
    }

    log.info("✅ {} classes créées", classesData.length);
  }

  private void createTimeSlots() {
    log.info("⏰ Création des créneaux horaires...");

    // Créneaux de la semaine (Lundi à Vendredi)
    DayOfWeek[] weekDays = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};

    // Horaires de la journée
    String[][] timeSlots = {
      {"08:30", "10:00"},
      {"10:15", "11:45"},
      {"12:00", "13:30"},
      {"13:45", "15:15"},
      {"15:30", "17:00"},
      {"17:15", "18:45"}
    };

    int slotCount = 0;
    for (DayOfWeek day : weekDays) {
      for (String[] timeSlot : timeSlots) {
        TimeSlot slot = new TimeSlot();
        slot.setDayOfWeek(day);
        slot.setStartTime(parseTime(timeSlot[0]));
        slot.setEndTime(parseTime(timeSlot[1]));
        slot.setName(getDayName(day) + " " + timeSlot[0] + "-" + timeSlot[1]);
        slot.setDescription("Créneau de cours");
        timeSlotRepository.save(slot);
        slotCount++;
      }
    }

    log.info("✅ {} créneaux horaires créés", slotCount);
  }

  private String getDayName(DayOfWeek day) {
    return switch (day) {
      case MONDAY -> "Lundi";
      case TUESDAY -> "Mardi";
      case WEDNESDAY -> "Mercredi";
      case THURSDAY -> "Jeudi";
      case FRIDAY -> "Vendredi";
      case SATURDAY -> "Samedi";
      case SUNDAY -> "Dimanche";
    };
  }

  private Date parseTime(String timeString) {
    try {
      LocalTime localTime = LocalTime.parse(timeString);
      LocalDate today = LocalDate.now();
      return Date.from(today.atTime(localTime).atZone(ZoneId.systemDefault()).toInstant());
    } catch (Exception e) {
      log.error("Erreur lors du parsing de l'heure: {}", timeString, e);
      return new Date();
    }
  }

  private void logCredentials() {
    log.info("");
    log.info("🔑 ===== COMPTES DE TEST CRÉÉS =====");
    log.info("📧 ADMIN:");
    log.info("   Email: admin@a");
    log.info("   Mot de passe: az");
    log.info("");
    log.info("👨‍🏫 PROFESSEUR:");
    log.info("   Email: prof@test.com");
    log.info("   Mot de passe: prof123");
    log.info("   Nom: Jean Dupont");
    log.info("");
    log.info("🎓 ÉTUDIANT:");
    log.info("   Email: etudiant@test.com");
    log.info("   Mot de passe: etudiant123");
    log.info("   Nom: Marie Martin");
    log.info("");
    log.info("👥 AUTRES PROFESSEURS:");
    log.info("   Email: sophie.bernard@test.com | Mot de passe: prof123");
    log.info("   Email: pierre.dubois@test.com | Mot de passe: prof123");
    log.info("   Email: laura.garcia@test.com | Mot de passe: prof123");
    log.info("   Email: thomas.wilson@test.com | Mot de passe: prof123");
    log.info("   Email: emma.johnson@test.com | Mot de passe: prof123");
    log.info("=====================================");
    log.info("");
  }
}
