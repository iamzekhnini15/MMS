import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Student, StudentContextType } from '../types';
import { getAuthenticatedUser } from '../utils/session';

const defaultContext: StudentContextType = {
  students: null,
  loading: true,
  error: null,
  getAllStudentsForClass: async () => {},
  addStudent: async () => {},
};

const StudentContext = createContext<StudentContextType>(defaultContext);

export const useStudents = () => useContext(StudentContext);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedUserFromStorage = getAuthenticatedUser();

  const getAllStudentsForClass = async (idClass: number) => {
    try {
      setLoading(true);

      // Vérification du token
      if (!authenticatedUserFromStorage?.token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(`/api/students/class/${idClass}`, {
        // Ajout du slash avant api
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authenticatedUserFromStorage.token}`,
          'Content-Type': 'application/json',
        },
      });

      // Récupérer le texte brut de la réponse (pour debug ou parse JSON)
      const text = await response.text();

      // Essayer de parser le JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Réponse non JSON reçue du serveur : ${text.substring(0, 100)}...`,
        );
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP: ${response.status}`);
      }

      const students: Student[] = data;
      setStudents(students);
      setError(null);
    } catch (err) {
      console.error('Erreur dans getAllStudentsForClass:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur inconnue lors du chargement des étudiants',
      );

      if (err instanceof TypeError) {
        // Erreur réseau
        setError('Problème de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (newStudentData: Omit<Student, 'idStudent'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `${authenticatedUserFromStorage?.token}`,
        },
        body: JSON.stringify(newStudentData),
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const createdStudent: Student = await response.json();
      setStudents((prev) =>
        prev ? [...prev, createdStudent] : [createdStudent],
      );
      setError(null);
    } catch (err) {
      console.error('addStudent::error', err);
      setError('Erreur lors de la création de l’étudiant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  const myContext: StudentContextType = {
    students,
    loading,
    error,
    getAllStudentsForClass,
    addStudent,
  };

  return (
    <StudentContext.Provider value={myContext}>
      {children}
    </StudentContext.Provider>
  );
};
