import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Classroom, ClassroomContextType } from '../types';

const defaultContext: ClassroomContextType = {
  classrooms: null,
  loading: true,
  error: null,
  fetchClassrooms: async () => {},
  createClassroom: async () => {},
};

const ClassroomContext = createContext<ClassroomContextType>(defaultContext);

export const useClassrooms = () => useContext(ClassroomContext);

export const ClassroomProvider = ({ children }: { children: ReactNode }) => {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classroom/getAll');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      console.log(data);
      setClassrooms(data);
      setError(null);
    } catch (err) {
      console.error('fetchClassrooms::error', err);
      setError('Erreur lors du chargement des salles.');
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (newClass: Omit<Classroom, 'idClassroom'>) => {
    try {
      setLoading(true);
      console.log(newClass);
      const response = await fetch('/api/classroom/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la création de la classe.',
        );
      }

      await fetchClassrooms();
      setError(null);
    } catch (err: any) {
      console.error('createClass::error', err);
      setError(err.message || 'Erreur lors de la création de la classe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <ClassroomContext.Provider
      value={{ classrooms, loading, error, fetchClassrooms, createClassroom }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};
