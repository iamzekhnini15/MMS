interface Address {
  idAddress?: number; // ID of the address (optional)
  street: string; // Street name
  number: string; // Number of the building
  box?: string; // Optional box/apartment number
  postalCode: string; // Postal code
  commune: string; // Municipality
  country: string; // Country
}

interface AuthenticatedUser {
  user: UserReceived;
  token: string;
}

interface Classes {
  idClass: number;
  name: string;
  level: number;
  department: string;
  responsibleTeacher: Teacher;
  courses: Course; // Correction: array of Course
}

interface ClassesContextType {
  classes: Classes[] | null;
  loading: boolean;
  error: string | null;
  fetchClasses: () => Promise<void>;
  fetchAllClasses: () => Promise<void>;
  createClass: (newClass: Omit<Classes, 'idClass'>) => Promise<void>;
}

interface Classroom {
  idClassroom: number;
  name: string;
  level: number;
  capacity: string;
}

interface ClassroomContextType {
  classrooms: Classroom[] | null;
  loading: boolean;
  error: string | null;
  fetchClassrooms: () => Promise<void>;
  createClassroom: (newClass: Omit<Classroom, 'idClassroom'>) => Promise<void>;
}

interface Course {
  idCourse: number;
  name: string;
  classroom: Classroom;
  teacher: Teacher;
  startDateTime: string; // ISO 8601 date string
  endDateTime: string; // ISO 8601 date string
}

interface CoursesContextType {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  createCourse: (newClass: Omit<Course, 'idCourse'>) => Promise<void>;
  deleteCourses: (idCourse: number) => Promise<void>;
}

interface File {
  idFile: number;
  name: string;
  url: string;
  subject: Subject;
  visible: boolean;
}

interface KpiData {
  teachers: number;
  classes: number;
}

interface KpiContextType {
  kpis: KpiData | null;
  loading: boolean;
  error: string | null;
  refreshKpis: () => Promise<void>;
}

type RegisterFormData = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone: string;
  role: string;
  civility: string;
  active: boolean;
  address: Address;
};

interface Student {
  idStudent: number;
  user: UserReceived;
  dateOfBirth: string;
  classId?: number;
}

interface StudentContextType {
  students: Student[] | null;
  loading: boolean;
  error: string | null;
  getAllStudentsForClass: (idClass: number) => Promise<void>;
  addStudent: (newStudentData: Omit<Student, 'idStudent'>) => Promise<void>;
}

interface Subject {
  idSubject?: number;
  name: string;
  description: string;
  coefficient: number;
  idCourse: number;
}

interface SubjectContextType {
  files: File[] | null;
  subjects: Subject[] | null;
  loading: boolean;
  error: string | null;
  fetchAllFile: () => Promise<void>;
  fetchSubject: () => Promise<void>;
  fetchAllSubjects: () => Promise<void>;
  fetchSubjectsByCourse: (courseId: number) => Promise<void>;
  toggleFileVisibility: (
    fileId: number,
    currentVisibility: boolean,
  ) => Promise<void>;
  createSubject: (newSubject: Omit<Subject, 'idSubject'>) => Promise<void>;
}

interface Teacher {
  idTeacher: number;
  specialities: string;
  contractType: string;
  availability: string;
  isfullTime: boolean;
  user: UserReceived;
}

interface TeacherContextType {
  teachers: Teacher[] | null;
  loading: boolean;
  error: string | null;
  deleteTeacher: (idTeacher: number) => Promise<void>;
  fetchTeachers: () => Promise<void>;
  createTeacher: (formData: TeacherFormData) => Promise<void>;
}

interface TeacherFormData {
  user: UserReceived;
  contractType: string;
  isFullTime: boolean;
  availability: string;
  specialities: string;
}

interface TeacherSubject {
  idTeacher: number;
  idSubject: number;
}

interface User {
  username?: string;
  password?: string;
}

// ===== GRADING SYSTEM TYPES =====

interface BulletinPeriod {
  idPeriod?: number;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  academicYear: string;
  isActive?: boolean;
  description?: string;
}

interface Evaluation {
  idEvaluation?: number;
  title: string;
  description?: string;
  subjectId: number;
  subjectName?: string;
  classId: number;
  className?: string;
  teacherId: number;
  teacherName?: string;
  periodId: number;
  periodName?: string;
  maxScore: number;
  evaluationDate: string; // ISO date string
  isVisible?: boolean;
  isGradesVisible?: boolean;
  type?:
    | 'INTERROGATION'
    | 'EXAMEN'
    | 'CONTROLE_CONTINU'
    | 'PROJET'
    | 'TRAVAIL_PRATIQUE'
    | 'ORAL';
  createdAt?: string; // ISO date string
}

interface EvaluationGrade {
  idGrade?: number;
  evaluationId: number;
  evaluationTitle?: string;
  maxScore?: number;
  studentId: number;
  studentName?: string;
  score: number;
  includeInCalculation?: boolean;
  status?: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE_SUBMISSION';
  comment?: string;
  gradedAt?: string; // ISO date string
  gradedById?: number;
  gradedByName?: string;
  percentage?: number; // Computed field
}

interface SubjectCoefficient {
  idCoefficient?: number;
  subjectId: number;
  subjectName?: string;
  classId: number;
  className?: string;
  coefficient: number;
  isActive?: boolean;
}

interface BulkGradeInput {
  evaluationId: number;
  grades: StudentGradeInput[];
}

interface StudentGradeInput {
  studentId: number;
  score: number;
  includeInCalculation?: boolean;
  status?: string;
  comment?: string;
}

interface StudentBulletin {
  idBulletin?: number;
  studentId: number;
  studentName?: string;
  className?: string;
  periodName?: string;
  academicYear?: string;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  generalComment?: string;
  pdfFilePath?: string;
  isVisible?: boolean;
  generatedAt?: string; // ISO date string
  subjectGrades?: SubjectGradeDetail[];
}

interface SubjectGradeDetail {
  subjectName: string;
  average: number;
  coefficient: number;
  weightedAverage: number;
  evaluationGrades: EvaluationGrade[];
}

// Context types for grading system
interface BulletinPeriodContextType {
  periods: BulletinPeriod[] | null;
  currentPeriod: BulletinPeriod | null;
  loading: boolean;
  error: string | null;
  fetchActivePeriods: () => Promise<void>;
  fetchCurrentPeriod: () => Promise<void>;
  createPeriod: (period: BulletinPeriod) => Promise<void>;
  updatePeriod: (id: number, period: BulletinPeriod) => Promise<void>;
  deletePeriod: (id: number) => Promise<void>;
}

interface EvaluationContextType {
  evaluations: Evaluation[] | null;
  evaluationGrades: EvaluationGrade[] | null;
  loading: boolean;
  error: string | null;
  fetchTeacherEvaluations: (teacherId: number) => Promise<void>;
  fetchEvaluationsByClass: (classId: number) => Promise<void>;
  fetchEvaluationById: (evaluationId: number) => Promise<Evaluation | null>;
  createEvaluation: (evaluation: Evaluation) => Promise<void>;
  updateEvaluation: (
    evaluationId: number,
    evaluation: Evaluation,
  ) => Promise<void>;
  deleteEvaluation: (evaluationId: number) => Promise<void>;
  fetchGradesByEvaluation: (evaluationId: number) => Promise<void>;
  fetchVisibleGradesByStudent: (studentId: number) => Promise<void>;
  submitGrades: (grades: BulkGradeInput) => Promise<void>;
  updateGrade: (grade: EvaluationGrade) => Promise<void>;
  deleteGrade: (gradeId: number) => Promise<void>;
  exportGrades: (evaluationId: number) => Promise<Blob>;
}

interface EvaluationGradeSubmission {
  studentId: number;
  grade: number;
  comment?: string;
}

interface GradeContextType {
  grades: EvaluationGrade[] | null;
  loading: boolean;
  error: string | null;
  fetchGradesByEvaluation: (evaluationId: number) => Promise<void>;
  fetchVisibleGradesByStudent: (studentId: number) => Promise<void>;
  saveGrade: (grade: Partial<EvaluationGrade>) => Promise<void>;
  saveBulkGrades: (
    bulkGrade: BulkGradeInput,
    teacherId: number,
  ) => Promise<void>;
  calculateSubjectAverage: (
    studentId: number,
    subjectId: number,
    periodId: number,
    averageType?: string,
  ) => Promise<number>;
  deleteGrade: (gradeId: number) => Promise<void>;
}

interface CoefficientContextType {
  coefficients: SubjectCoefficient[] | null;
  loading: boolean;
  error: string | null;
  fetchCoefficientsByClass: (classId: number) => Promise<void>;
  fetchAllCoefficients: () => Promise<void>;
  saveCoefficient: (coefficient: SubjectCoefficient) => Promise<void>;
  saveBulkCoefficients: (
    classId: number,
    coefficients: SubjectCoefficient[],
  ) => Promise<void>;
  deleteCoefficient: (coefficientId: number) => Promise<void>;
}

interface User {
  email?: string;
  password?: string;
}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: User) => Promise<void>;
  loginUser: (user: User, rememberMe: boolean) => Promise<void>;
  clearUser: () => void;
}

interface UserReceived {
  idUser: number;
  email: string;
  password: string;
  address: Address;
  lastname: string;
  firstname: string;
  phone: string;
  role: string;
  registrationDate?: string; // ISO 8601 date string, optional
  civility: string;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

export type {
  Address,
  AuthenticatedUser,
  BulkGradeInput,
  BulletinPeriod,
  BulletinPeriodContextType,
  Classes,
  ClassesContextType,
  Classroom,
  ClassroomContextType,
  CoefficientContextType,
  Course,
  CoursesContextType,
  Evaluation,
  EvaluationContextType,
  EvaluationGrade,
  EvaluationGradeSubmission,
  File,
  GradeContextType,
  KpiContextType,
  KpiData,
  RegisterFormData,
  Student,
  StudentBulletin,
  StudentContextType,
  StudentGradeInput,
  Subject,
  SubjectContextType,
  SubjectCoefficient,
  SubjectGradeDetail,
  Teacher,
  TeacherContextType,
  TeacherFormData,
  TeacherSubject,
  User,
  UserContextType,
  UserReceived,
  MaybeAuthenticatedUser,
};
