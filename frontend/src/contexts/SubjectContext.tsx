import { createContext, useState, ReactNode } from 'react';
import { Subject, SubjectContextType, File } from '../types';
// import { getAuthenticatedUser } from '../utils/session';

const defaultContext: SubjectContextType = {
  files: null,
  subjects: null,
  loading: false,
  error: null,
  fetchAllFile: async () => {},
  fetchSubject: async () => {},
  fetchSubjectsByCourse: async () => {},
  toggleFileVisibility: async () => {},
  createSubject: async () => {},
};

const SubjectContext = createContext<SubjectContextType>(defaultContext);

const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const authenticatedUserFromStorage = getAuthenticatedUser();

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subject/getAll');
      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log(data);
      setSubjects(data);
      setError(null);
    } catch (err) {
      console.error('fetchCourses::error', err);
      setError('Erreur lors du chargement des cours.');
    } finally {
      setLoading(false);
    }
  };

  async function fetchSubjectsByCourse(courseId: number) {
    const res = await fetch(`/api/subject/${courseId}`);
    const data = await res.json();
    setSubjects(data);
  }

  const createSubject = async (newCourse: Omit<Subject, 'idSubject'>) => {
    try {
      setLoading(true);
      console.log(newCourse);
      const response = await fetch('/api/subject/create', {
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
      setError(null);
      await fetchSubjectsByCourse(newCourse.idCourse);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('createClass::error', err);
        setError(err.message || 'Erreur lors de la création du cours.');
      } else {
        console.error('createClass::error', err);
        setError('Erreur inconnue lors de la création du cours.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/file/getAll`);
      if (!response.ok) {
        throw new Error(
          `fetch error : ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      console.log(data);
      setFiles(data);
      setError(null);
    } catch (err) {
      console.error('fetchFileBySubject::error', err);
      setError('Erreur lors du chargement des fichiers.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFileVisibility = async (
    fileId: number,
    currentVisibility: boolean,
  ) => {
    try {
      const response = await fetch(`/api/file/${fileId}/toggleVisibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !currentVisibility }),
      });

      if (!response.ok)
        throw new Error('Erreur lors de la mise à jour de la visibilité');

      await fetchAllFile();
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue lors de la mise à jour de la visibilité.');
    }
  };

  const myContext: SubjectContextType = {
    fetchAllFile,
    fetchSubject,
    fetchSubjectsByCourse,
    toggleFileVisibility,
    createSubject,
    files,
    subjects,
    loading,
    error,
  };

  return (
    <SubjectContext.Provider value={myContext}>
      {children}
    </SubjectContext.Provider>
  );
};

export { SubjectContext, SubjectProvider };
