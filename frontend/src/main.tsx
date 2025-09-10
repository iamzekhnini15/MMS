import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import '@fontsource/roboto/700.css';
import './index.css';

import App from './components/App';
import HomePage from './components/pages/HomePage';
import { RegisterPage } from './components/pages/RegisterPage';
import Schedule from './components/pages/SchedulePage';
import Courses from './components/pages/admin/CoursesPage';
import DashboardPage from './components/pages/admin/DashboardPage';
import ManageClass from './components/pages/admin/ManageClass';
import ManageTeacher from './components/pages/admin/ManageTeacher';
import ManageClassroom from './components/pages/admin/ManageClassroom';
import ClassDetailPage from './components/pages/admin/ClassDetailsPage';
import CourseDetailPage from './components/pages/admin/CourseDetailsPage';
import ManageTimetables from './components/pages/admin/ManageTimetables';
import AdminScheduleViewer from './components/pages/admin/AdminScheduleViewer';
import {
  TeacherDashboard,
  TeacherSchedule,
  EvaluationsManagement,
  GradeEntry,
  BulletinPeriodsManagement,
  TeacherGradesPage,
  TeacherCoefficientsPage,
  TeacherClassesPage,
  TeacherBulletinsPage,
} from './components/pages/teacher';
import { RoleBasedDashboardRedirect } from './components/pages/RoleBasedDashboardRedirect';
import DetailedBulletinPage from './components/pages/teacher/DetailedBulletinPage';
import {
  MyGradesPage,
  StudentDashboard,
  StudentSchedule,
  StudentBulletins,
  StudentResources,
} from './components/pages/student';
import { LoginForm } from './components/login-form';
import ProtectedRoute from './components/ProtectedRoutes';
import SettingsPage from './components/pages/SettingsPage';

import { UserContextProvider } from './contexts/UserContext';
import { KpiContextProvider } from './contexts/DashboardContext';
import { CoursesProvider } from './contexts/CoursesContext';
import { TeacherProvider } from './contexts/TeacherContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import { ClassesProvider } from './contexts/ClassesContext';
import { StudentProvider } from './contexts/StudentContext';
import { SubjectProvider } from './contexts/SubjectContext';
import { TimetableProvider } from './contexts/TimetableContext';
import { BulletinPeriodProvider } from './contexts/BulletinPeriodContext';
import { BulletinProvider } from './contexts/BulletinContext';
import { BulletinCalculationProvider } from './contexts/BulletinCalculationContext';
import { StudentBulletinProvider } from './contexts/StudentBulletinContext';
import { EvaluationProvider } from './contexts/EvaluationContext';
import { StatsProvider } from './contexts/StatsContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

import theme from './themes';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <UserContextProvider>
        <App />
      </UserContextProvider>
    ),
    children: [
      { path: '', element: <HomePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN', 'TEACHER', 'STUDENT']}
            element={<RoleBasedDashboardRedirect />}
          />
        ),
      },
      {
        path: 'schedule',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN', 'TEACHER', 'STUDENT']}
            element={
              <CoursesProvider>
                <TeacherProvider>
                  <ClassroomProvider>
                    <ClassesProvider>
                      <Schedule />
                    </ClassesProvider>
                  </ClassroomProvider>
                </TeacherProvider>
              </CoursesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-courses',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <CoursesProvider>
                <TeacherProvider>
                  <ClassroomProvider>
                    <Courses />
                  </ClassroomProvider>
                </TeacherProvider>
              </CoursesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-courses/:id',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <CoursesProvider>
                <TeacherProvider>
                  <SubjectProvider>
                    <CourseDetailPage />
                  </SubjectProvider>
                </TeacherProvider>
              </CoursesProvider>
            }
          />
        ),
      },
      // Student-facing course details (professional URL)
      {
        path: 'courses/:id',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={
              <CoursesProvider>
                <TeacherProvider>
                  <SubjectProvider>
                    <CourseDetailPage />
                  </SubjectProvider>
                </TeacherProvider>
              </CoursesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-teachers',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <CoursesProvider>
                <TeacherProvider>
                  <ClassroomProvider>
                    <ClassesProvider>
                      <ManageTeacher />
                    </ClassesProvider>
                  </ClassroomProvider>
                </TeacherProvider>
              </CoursesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-classes',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <ClassesProvider>
                <TeacherProvider>
                  <ManageClass />
                </TeacherProvider>
              </ClassesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-classes/:id',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <ClassesProvider>
                <TeacherProvider>
                  <StudentProvider>
                    <ClassDetailPage />
                  </StudentProvider>
                </TeacherProvider>
              </ClassesProvider>
            }
          />
        ),
      },
      {
        path: 'manage-classroom',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <ClassroomProvider>
                <ManageClassroom />
              </ClassroomProvider>
            }
          />
        ),
      },
      // Routes spécifiques par rôle pour les dashboards
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <KpiContextProvider>
                <CoursesProvider>
                  <TeacherProvider>
                    <ClassroomProvider>
                      <ClassesProvider>
                        <DashboardPage />
                      </ClassesProvider>
                    </ClassroomProvider>
                  </TeacherProvider>
                </CoursesProvider>
              </KpiContextProvider>
            }
          />
        ),
      },
      {
        path: 'manage-timetables',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <TimetableProvider>
                <ClassesProvider>
                  <SubjectProvider>
                    <CoursesProvider>
                      <TeacherProvider>
                        <ClassroomProvider>
                          <ManageTimetables />
                        </ClassroomProvider>
                      </TeacherProvider>
                    </CoursesProvider>
                  </SubjectProvider>
                </ClassesProvider>
              </TimetableProvider>
            }
          />
        ),
      },
      {
        path: 'view-schedules',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN']}
            element={
              <ClassesProvider>
                <TeacherProvider>
                  <AdminScheduleViewer />
                </TeacherProvider>
              </ClassesProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/dashboard',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER']}
            element={
              <BulletinPeriodProvider>
                <EvaluationProvider>
                  <ClassesProvider>
                    <StudentProvider>
                      <SubjectProvider>
                        <TeacherDashboard />
                      </SubjectProvider>
                    </StudentProvider>
                  </ClassesProvider>
                </EvaluationProvider>
              </BulletinPeriodProvider>
            }
          />
        ),
      },
      {
        path: 'teacher',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <BulletinPeriodProvider>
                <EvaluationProvider>
                  <ClassesProvider>
                    <StudentProvider>
                      <SubjectProvider>
                        <TeacherDashboard />
                      </SubjectProvider>
                    </StudentProvider>
                  </ClassesProvider>
                </EvaluationProvider>
              </BulletinPeriodProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/evaluations',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <BulletinPeriodProvider>
                <EvaluationProvider>
                  <ClassesProvider>
                    <StudentProvider>
                      <SubjectProvider>
                        <EvaluationsManagement teacherId={1} />
                      </SubjectProvider>
                    </StudentProvider>
                  </ClassesProvider>
                </EvaluationProvider>
              </BulletinPeriodProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/grades/:evaluationId',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <EvaluationProvider>
                <StudentProvider>
                  <GradeEntry />
                </StudentProvider>
              </EvaluationProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/periods',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <BulletinPeriodProvider>
                <BulletinPeriodsManagement />
              </BulletinPeriodProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/grades',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <EvaluationProvider>
                <BulletinPeriodProvider>
                  <ClassesProvider>
                    <SubjectProvider>
                      <TeacherGradesPage />
                    </SubjectProvider>
                  </ClassesProvider>
                </BulletinPeriodProvider>
              </EvaluationProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/coefficients',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <ClassesProvider>
                <SubjectProvider>
                  <TeacherCoefficientsPage />
                </SubjectProvider>
              </ClassesProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/classes',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <ClassesProvider>
                <StudentProvider>
                  <StatsProvider>
                    <TeacherClassesPage />
                  </StatsProvider>
                </StudentProvider>
              </ClassesProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/bulletins',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <BulletinPeriodProvider>
                <ClassesProvider>
                  <StudentProvider>
                    <SubjectProvider>
                      <BulletinProvider>
                        <BulletinCalculationProvider>
                          <StudentBulletinProvider>
                            <TeacherBulletinsPage />
                          </StudentBulletinProvider>
                        </BulletinCalculationProvider>
                      </BulletinProvider>
                    </SubjectProvider>
                  </StudentProvider>
                </ClassesProvider>
              </BulletinPeriodProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/bulletins/detail/:studentId/:periodId',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER', 'ADMIN']}
            element={
              <StudentBulletinProvider>
                <DetailedBulletinPage />
              </StudentBulletinProvider>
            }
          />
        ),
      },
      {
        path: 'teacher/schedule',
        element: (
          <ProtectedRoute
            requiredRoles={['TEACHER']}
            element={<TeacherSchedule />}
          />
        ),
      },
      {
        path: 'student',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={<StudentDashboard />}
          />
        ),
      },
      {
        path: 'student/grades',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={
              <EvaluationProvider>
                <BulletinPeriodProvider>
                  <SubjectProvider>
                    <MyGradesPage />
                  </SubjectProvider>
                </BulletinPeriodProvider>
              </EvaluationProvider>
            }
          />
        ),
      },
      {
        path: 'student/schedule',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={<StudentSchedule />}
          />
        ),
      },
      {
        path: 'student/bulletins',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={<StudentBulletins />}
          />
        ),
      },
      {
        path: 'student/bulletins/detail/:studentId/:periodId',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={
              <StudentBulletinProvider>
                <DetailedBulletinPage />
              </StudentBulletinProvider>
            }
          />
        ),
      },
      {
        path: 'student/resources',
        element: (
          <ProtectedRoute
            requiredRoles={['STUDENT', 'ADMIN']}
            element={<StudentResources />}
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute
            requiredRoles={['ADMIN', 'TEACHER', 'STUDENT']}
            element={<SettingsPage />}
          />
        ),
      },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginForm /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomThemeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </CustomThemeProvider>
  </React.StrictMode>,
);
