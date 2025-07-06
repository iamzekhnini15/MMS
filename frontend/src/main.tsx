import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/index.tsx';
import HomePage from './components/pages/HomePage.tsx';
import { RegisterPage } from './components/pages/RegisterPage.tsx';
// import LoginPage from './components/pages/LoginPage.tsx';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import Schedule from './components/pages/SchedulePage.tsx';
import Courses from './components/pages/admin/CoursesPage.tsx';
import { UserContextProvider } from './contexts/UserContext.tsx';
import { KpiContextProvider } from './contexts/DashboardContext.tsx';
import DashboardPage from './components/pages/admin/DashboardPage.tsx';
import { CoursesProvider } from './contexts/CoursesContext.tsx';
import { TeacherProvider } from './contexts/TeacherContext.tsx';
import { ClassroomProvider } from './contexts/ClassroomContext.tsx';
import ManageClass from './components/pages/admin/ManageClass.tsx';
import { ClassesProvider } from './contexts/ClassesContext.tsx';
import ManageTeacher from './components/pages/admin/ManageTeacher.tsx';
import ClassDetailPage from './components/pages/admin/ClassDetailsPage.tsx';
import { StudentProvider } from './contexts/StudentContext.tsx';
import ProtectedRoute from './components/ProtectedRoutes.tsx';
import { LoginForm } from './components/login-form.tsx';
import ManageClassroom from './components/pages/admin/ManageClassroom.tsx';
import { SubjectProvider } from './contexts/SubjectContext.tsx';
import CourseDetailPage from './components/pages/admin/CourseDetailsPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <UserContextProvider>
        <App />
      </UserContextProvider>
    ),
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'dashboard',
        element: (
          <KpiContextProvider>
            <DashboardPage />
          </KpiContextProvider>
        ),
      },
      {
        path: 'schedule',
        element: <Schedule />,
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
            element={
              <ClassroomProvider>
                <ManageClassroom />
              </ClassroomProvider>
            }
            requiredRoles={['ADMIN']}
          />
        ),
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Global CSS reset from Material-UI */}
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
