// Configuration API centralisée
export const API_BASE_URL = 'http://localhost:3000';

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
} as const;
