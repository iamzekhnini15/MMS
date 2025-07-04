import { createContext, useEffect, useState, ReactNode } from 'react';
import { Course, CoursesContextType } from '../types';
import { getAuthenticatedUser } from '../utils/session';

const defaultContext: CoursesContextType = {
  courses: null,
  loading: true,
  error: null,
  fetchCourses: async () => {},
  createCourse: async () => {},
  deleteCourses: async () => {},
};

const CoursesContext = createContext<CoursesContextType>(defaultContext);

const CoursesProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticatedUserFromStorage = getAuthenticatedUser();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses/getAll');
      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log(data);
      setCourses(data);
      setError(null);
    } catch (err) {
      console.error('fetchCourses::error', err);
      setError('Erreur lors du chargement des cours.');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (newCourse: Omit<Course, 'idCourse'>) => {
    try {
      setLoading(true);
      console.log(newCourse);
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la création du cours.',
        );
      }

      await fetchCourses();
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('fetchClasses::error', err);
        setError(err.message || 'Erreur lors de la création du cours.');
      } else {
        console.error('fetchClasses::error', err);
        setError('Erreur inconnue lors de la création du cours.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCourses = async (idCourse: number) => {
    try {
      const response = await fetch(`/api/courses/delete/${idCourse}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUserFromStorage?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const data = await response.text();
      console.log('Élément supprimé:', data);
      await fetchCourses();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'élément du panier:",
        error,
      );
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const myContext: CoursesContextType = {
    fetchCourses,
    createCourse,
    deleteCourses,
    courses,
    loading,
    error,
  };

  return (
    <CoursesContext.Provider value={myContext}>
      {children}
    </CoursesContext.Provider>
  );
};

export { CoursesContext, CoursesProvider };
