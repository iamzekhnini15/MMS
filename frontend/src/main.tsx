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
import {
  TeacherDashboard,
  EvaluationsManagement,
  GradeEntry,
  BulletinPeriodsManagement,
  TeacherGradesPage,
  TeacherCoefficientsPage,
  TeacherClassesPage,
  TeacherBulletinsPage,
} from './components/pages/teacher';
import { LoginForm } from './components/login-form';
import ProtectedRoute from './components/ProtectedRoutes';

import { UserContextProvider } from './contexts/UserContext';
import { KpiContextProvider } from './contexts/DashboardContext';
import { CoursesProvider } from './contexts/CoursesContext';
import { TeacherProvider } from './contexts/TeacherContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import { ClassesProvider } from './contexts/ClassesContext';
import { StudentProvider } from './contexts/StudentContext';
import { SubjectProvider } from './contexts/SubjectContext';
import { BulletinPeriodProvider } from './contexts/BulletinPeriodContext';
import { EvaluationProvider } from './contexts/EvaluationContext';

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
        ),
      },
      {
        path: 'schedule',
        element: (
          <CoursesProvider>
            <TeacherProvider>
              <ClassroomProvider>
                <ClassesProvider>
                  <Schedule />
                </ClassesProvider>
              </ClassroomProvider>
            </TeacherProvider>
          </CoursesProvider>
        ),
      },
      {
        path: 'manage-courses',
        element: (
          <CoursesProvider>
            <TeacherProvider>
              <ClassroomProvider>
                <Courses />
              </ClassroomProvider>
            </TeacherProvider>
          </CoursesProvider>
        ),
      },
      {
        path: 'manage-courses/:id',
        element: (
          <CoursesProvider>
            <TeacherProvider>
              <SubjectProvider>
                <CourseDetailPage />
              </SubjectProvider>
            </TeacherProvider>
          </CoursesProvider>
        ),
      },
      {
        path: 'manage-teachers',
        element: (
          <CoursesProvider>
            <TeacherProvider>
              <ClassroomProvider>
                <ClassesProvider>
                  <ManageTeacher />
                </ClassesProvider>
              </ClassroomProvider>
            </TeacherProvider>
          </CoursesProvider>
        ),
      },
      {
        path: 'manage-classes',
        element: (
          <ClassesProvider>
            <TeacherProvider>
              <ManageClass />
            </TeacherProvider>
          </ClassesProvider>
        ),
      },
      {
        path: 'manage-classes/:id',
        element: (
          <ClassesProvider>
            <TeacherProvider>
              <StudentProvider>
                <ClassDetailPage />
              </StudentProvider>
            </TeacherProvider>
          </ClassesProvider>
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
                  <TeacherClassesPage />
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
                <TeacherBulletinsPage />
              </BulletinPeriodProvider>
            }
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
