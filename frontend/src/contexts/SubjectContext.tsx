import { createContext, useState, ReactNode, useCallback } from 'react';
import { Subject, SubjectContextType, File } from '../types';
// import { getAuthenticatedUser } from '../utils/session';

const defaultContext: SubjectContextType = {
  files: null,
  subjects: null,
  loading: false,
  error: null,
  fetchAllFile: async () => {},
  fetchSubject: async () => {},
  fetchAllSubjects: async () => {},
  fetchSubjectsByCourse: async () => {},
  toggleFileVisibility: async () => {},
  createSubject: async () => {},
  deleteFile: async () => {},
};

const SubjectContext = createContext<SubjectContextType>(defaultContext);

const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Listen to global file-updated events dispatched from the SSE listener
  if (typeof window !== 'undefined') {
    window.addEventListener('file-updated', (evt: Event) => {
      const custom = evt as CustomEvent;
      const updatedFile = custom.detail as File;
      setFiles((prev) => {
        if (!prev) return prev;
        const exists = prev.some((f) => f.idFile === updatedFile.idFile);
        if (exists) {
          return prev.map((f) =>
            f.idFile === updatedFile.idFile ? updatedFile : f,
          );
        }
        return [...prev, updatedFile];
      });
    });
    window.addEventListener('file-deleted', (evt: Event) => {
      const custom = evt as CustomEvent;
      const id = custom.detail as number;
      setFiles((prev) => (prev ? prev.filter((f) => f.idFile !== id) : prev));
    });
  }

  // const authenticatedUserFromStorage = getAuthenticatedUser();

  const fetchSubject = useCallback(async () => {
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
      console.error('fetchSubjects::error', err);
      setError('Erreur lors du chargement des matières.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjectsByCourse = useCallback(async (courseId: number) => {
    const res = await fetch(`/api/subject/${courseId}`);
    const data = await res.json();
    setSubjects(data);
  }, []);

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

  const fetchAllFile = useCallback(async () => {
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
  }, []);

  const toggleFileVisibility = useCallback(
    async (fileId: number, currentVisibility: boolean) => {
      // Optimistic update: update local state immediately
      if (!files) return;
      const prevFiles = files;
      const updatedFiles = files.map((f) =>
        f.idFile === fileId ? { ...f, visible: !currentVisibility } : f,
      );
      setFiles(updatedFiles);

      try {
        const response = await fetch(`/api/file/${fileId}/toggleVisibility`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visible: !currentVisibility }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour de la visibilité');
        }

        // Optionally refresh in background to sync server state (non-blocking)
        fetchAllFile().catch((e) =>
          console.warn('Background refresh failed', e),
        );
      } catch (error) {
        console.error(error);
        // Revert local state
        setFiles(prevFiles);
        alert(
          'Une erreur est survenue lors de la mise à jour de la visibilité.',
        );
      }
    },
    [fetchAllFile, files],
  );

  const deleteFile = useCallback(
    async (fileId: number) => {
      if (!files) return;
      const prevFiles = files;
      // optimistic remove
      setFiles(files.filter((f) => f.idFile !== fileId));
      try {
        const response = await fetch(`/api/file/${fileId}`, {
          method: 'DELETE',
        });
        if (!response.ok)
          throw new Error('Erreur lors de la suppression du fichier');
      } catch (err) {
        console.error(err);
        setFiles(prevFiles);
        alert('Une erreur est survenue lors de la suppression du fichier.');
      }
    },
    [files],
  );

  // Alias for fetchSubject to match the interface
  const fetchAllSubjects = fetchSubject;

  const myContext: SubjectContextType = {
    fetchAllFile,
    fetchSubject,
    fetchAllSubjects,
    fetchSubjectsByCourse,
    toggleFileVisibility,
    deleteFile,
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

// Subscribe to server-sent events to update files in real-time
// We attach the subscription globally when this module is imported
if (typeof window !== 'undefined') {
  try {
    const evtSource = new EventSource('/api/file/stream');
    evtSource.addEventListener('file-updated', (e: MessageEvent) => {
      try {
        const updated = JSON.parse(e.data);
        // Dispatch a custom event so providers/components can react
        window.dispatchEvent(
          new CustomEvent('file-updated', { detail: updated }),
        );
      } catch (err) {
        console.warn('Failed to parse SSE file-updated', err);
      }
    });
    evtSource.addEventListener('file-deleted', (e: MessageEvent) => {
      try {
        const id = JSON.parse(e.data) as number;
        window.dispatchEvent(new CustomEvent('file-deleted', { detail: id }));
      } catch (err) {
        console.warn('Failed to parse SSE file-deleted', err);
      }
    });
  } catch (err) {
    console.warn('SSE not available', err);
  }
}
