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
  user: UserReceived;
  dateOfBirth: string;
  classId: number;
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
  email: string;
  password: string;
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
  Classes,
  ClassesContextType,
  Classroom,
  ClassroomContextType,
  Course,
  CoursesContextType,
  File,
  KpiContextType,
  KpiData,
  RegisterFormData,
  Student,
  StudentContextType,
  Subject,
  SubjectContextType,
  Teacher,
  TeacherContextType,
  TeacherFormData,
  TeacherSubject,
  User,
  UserContextType,
  UserReceived,
  MaybeAuthenticatedUser,
};
