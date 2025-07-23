// Configuration API centralisée
export const API_BASE_URL = '/api'; // Utiliser le proxy Vite

// Helper function pour construire les URLs d'API
export const buildApiUrl = (path: string): string => {
  // Enlever le slash initial si présent
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

// Routes API
export const API_ROUTES = {
  // Auth
  AUTH_ME: '/auths/me',
  AUTH_LOGIN: '/auths/login',
  AUTH_REGISTER: '/auths/register',

  // Courses
  COURSES_GET_ALL: '/courses/getAll',
  COURSES_CREATE: '/courses/create',
  COURSES_DELETE: (id: number) => `/courses/delete/${id}`,

  // Teachers
  TEACHERS_GET_ALL: '/teachers/getAll',
  TEACHERS_CREATE: '/teachers/create',
  TEACHERS_DELETE: (id: number) => `/teachers/delete/${id}`,

  // Classes
  CLASSES_GET_ALL: '/classes/getAll',
  CLASSES_CREATE: '/classes/create',

  // Classrooms
  CLASSROOM_GET_ALL: '/classroom/getAll',
  CLASSROOM_CREATE: '/classroom/create',

  // Students
  STUDENTS_BY_CLASS: (classId: number) => `/students/class/${classId}`,
  STUDENTS_CREATE: '/students/create',

  // Subjects
  SUBJECT_GET_ALL: '/subject/getAll',
  SUBJECT_BY_ID: (id: number) => `/subject/${id}`,
  SUBJECT_CREATE: '/subject/create',

  // Files
  FILE_GET_ALL: '/file/getAll',
  FILE_TOGGLE_VISIBILITY: (id: number) => `/file/${id}/toggleVisibility`,

  // Dashboard
  DASHBOARD_KPIS: '/dashboard/kpis',

  // Bulletin Periods
  BULLETIN_PERIODS_ACTIVE: '/bulletin-periods/active',
  BULLETIN_PERIODS_CURRENT: '/bulletin-periods/current',
  BULLETIN_PERIODS_BY_YEAR: (year: string) => `/bulletin-periods/year/${year}`,
  BULLETIN_PERIODS_CREATE: '/bulletin-periods/create',
  BULLETIN_PERIODS_BY_ID: (id: number) => `/bulletin-periods/${id}`,
  BULLETIN_PERIODS_UPDATE: (id: number) => `/bulletin-periods/${id}`,
  BULLETIN_PERIODS_DELETE: (id: number) => `/bulletin-periods/${id}`,

  // Evaluations
  EVALUATIONS_BY_TEACHER: (teacherId: number) =>
    `/evaluations/teacher/${teacherId}`,
  EVALUATIONS_BY_SUBJECT_CLASS: (subjectId: number, classId: number) =>
    `/evaluations/subject/${subjectId}/class/${classId}`,
  EVALUATIONS_BY_SUBJECT_CLASS_PERIOD: (
    subjectId: number,
    classId: number,
    periodId: number,
  ) => `/evaluations/subject/${subjectId}/class/${classId}/period/${periodId}`,
  EVALUATIONS_VISIBLE: (classId: number, periodId: number) =>
    `/evaluations/visible/class/${classId}/period/${periodId}`,
  EVALUATIONS_BY_ID: (id: number) => `/evaluations/${id}`,
  EVALUATIONS_CREATE: '/evaluations/create',
  EVALUATIONS_UPDATE: (id: number) => `/evaluations/${id}`,
  EVALUATIONS_TOGGLE_VISIBILITY: (id: number) =>
    `/evaluations/${id}/toggle-visibility`,
  EVALUATIONS_TOGGLE_GRADES_VISIBILITY: (id: number) =>
    `/evaluations/${id}/toggle-grades-visibility`,
  EVALUATIONS_DELETE: (id: number) => `/evaluations/${id}`,

  // Grades
  GRADES_BY_EVALUATION: (evaluationId: number) =>
    `/grades/evaluation/${evaluationId}`,
  GRADES_VISIBLE_BY_STUDENT: (studentId: number) =>
    `/grades/student/${studentId}/visible`,
  GRADES_FOR_CALCULATION: (
    studentId: number,
    subjectId: number,
    periodId: number,
  ) =>
    `/grades/calculation/student/${studentId}/subject/${subjectId}/period/${periodId}`,
  GRADES_AVERAGE: (studentId: number, subjectId: number, periodId: number) =>
    `/grades/average/student/${studentId}/subject/${subjectId}/period/${periodId}`,
  GRADES_BY_ID: (gradeId: number) => `/grades/${gradeId}`,
  GRADES_SAVE: '/grades/save',
  GRADES_BULK_SAVE: '/grades/bulk-save',
  GRADES_DELETE: (gradeId: number) => `/grades/${gradeId}`,

  // Subject Coefficients
  COEFFICIENTS_BY_CLASS: (classId: number) => `/coefficients/class/${classId}`,
  COEFFICIENTS_BY_SUBJECT: (subjectId: number) =>
    `/coefficients/subject/${subjectId}`,
  COEFFICIENTS_BY_SUBJECT_CLASS: (subjectId: number, classId: number) =>
    `/coefficients/subject/${subjectId}/class/${classId}`,
  COEFFICIENTS_VALUE: (subjectId: number, classId: number) =>
    `/coefficients/value/subject/${subjectId}/class/${classId}`,
  COEFFICIENTS_ALL: '/coefficients/all',
  COEFFICIENTS_SAVE: '/coefficients/save',
  COEFFICIENTS_BULK_SAVE: (classId: number) =>
    `/coefficients/bulk-save/class/${classId}`,
  COEFFICIENTS_DEACTIVATE: (coefficientId: number) =>
    `/coefficients/${coefficientId}/deactivate`,
  COEFFICIENTS_DELETE: (coefficientId: number) =>
    `/coefficients/${coefficientId}`,
} as const;
