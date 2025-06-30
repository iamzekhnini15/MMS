import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Teacher, TeacherContextType } from '../types';
import { getAuthenticatedUser } from '../utils/session';

const defaultContext: TeacherContextType = {
  teachers: null,
  loading: true,
  error: null,
  deleteTeacher: async () => {},
  fetchTeachers: async () => {},
  createTeacher: async () => {},
};

const TeacherContext = createContext<TeacherContextType>(defaultContext);

export const useTeachers = () => useContext(TeacherContext);

export const TeacherProvider = ({ children }: { children: ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedUserFromStorage = getAuthenticatedUser();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers/getAll');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setTeachers(data);
      setError(null);
    } catch (err) {
      console.error('fetchTeachers::error', err);
      setError('Erreur lors du chargement des enseignants.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (idTeacher: number) => {
    try {
      const response = await fetch(`/api/teachers/delete/${idTeacher}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUserFromStorage?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'élément du panier");
      }

      const data = await response.text();
      console.log('Élément supprimé:', data);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'élément du panier:",
        error,
      );
    }
  };

  const createTeacher = async (formData: any) => {
    console.log(formData);
    try {
      const response = await fetch('/api/teachers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUserFromStorage?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'enseignant.");
      }

      const newTeacher = await response.json();
      setTeachers((prev) => (prev ? [...prev, newTeacher] : [newTeacher]));
      setError(null);
    } catch (err) {
      console.error('createTeacher::error', err);
      setError("Erreur lors de la création de l'enseignant.");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const myContext: TeacherContextType = {
    fetchTeachers,
    deleteTeacher,
    createTeacher,
    teachers,
    loading,
    error,
  };

  return (
    <TeacherContext.Provider value={myContext}>
      {children}
    </TeacherContext.Provider>
  );
};
