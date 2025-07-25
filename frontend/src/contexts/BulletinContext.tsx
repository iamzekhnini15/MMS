import { createContext, useState, ReactNode, useCallback } from 'react';

interface StudentBulletin {
  idBulletin: number;
  studentId: number;
  periodId: number;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  generalComment?: string;
  isVisible: boolean;
  generatedAt: string;
}

interface BulletinContextType {
  bulletins: StudentBulletin[] | null;
  loading: boolean;
  error: string | null;
  fetchBulletinsByClassAndPeriod: (
    classId: number,
    periodId: number,
  ) => Promise<void>;
  updateBulletinComment: (bulletinId: number, comment: string) => Promise<void>;
  toggleBulletinVisibility: (bulletinId: number) => Promise<void>;
}

const defaultBulletinContext: BulletinContextType = {
  bulletins: null,
  loading: false,
  error: null,
  fetchBulletinsByClassAndPeriod: async () => {},
  updateBulletinComment: async () => {},
  toggleBulletinVisibility: async () => {},
};

const BulletinContext = createContext<BulletinContextType>(
  defaultBulletinContext,
);

export const BulletinProvider = ({ children }: { children: ReactNode }) => {
  const [bulletins, setBulletins] = useState<StudentBulletin[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBulletinsByClassAndPeriod = useCallback(
    async (classId: number, periodId: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/bulletins/class/${classId}/period/${periodId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setBulletins(data);
        } else {
          // If no bulletins exist, create mock bulletins for students
          setBulletins([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBulletins([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateBulletinComment = useCallback(
    async (bulletinId: number, comment: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/bulletins/${bulletinId}?comment=${encodeURIComponent(comment)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          setBulletins(
            (prev) =>
              prev?.map((bulletin) =>
                bulletin.idBulletin === bulletinId
                  ? { ...bulletin, generalComment: comment }
                  : bulletin,
              ) || null,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const toggleBulletinVisibility = useCallback(
    async (bulletinId: number) => {
      setLoading(true);
      setError(null);
      try {
        const bulletin = bulletins?.find((b) => b.idBulletin === bulletinId);
        if (!bulletin) return;

        const response = await fetch(
          `/api/bulletins/${bulletinId}?isVisible=${!bulletin.isVisible}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.ok) {
          setBulletins(
            (prev) =>
              prev?.map((b) =>
                b.idBulletin === bulletinId
                  ? { ...b, isVisible: !b.isVisible }
                  : b,
              ) || null,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [bulletins],
  );

  const value: BulletinContextType = {
    bulletins,
    loading,
    error,
    fetchBulletinsByClassAndPeriod,
    updateBulletinComment,
    toggleBulletinVisibility,
  };

  return (
    <BulletinContext.Provider value={value}>
      {children}
    </BulletinContext.Provider>
  );
};

export default BulletinContext;
