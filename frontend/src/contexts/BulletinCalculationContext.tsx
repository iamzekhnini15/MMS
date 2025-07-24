import React, { createContext, useCallback, useState } from 'react';

// Interface pour les statistiques de classe
interface ClassStatistics {
  studentAverages: { [studentId: number]: number };
  classAverage: number;
  totalStudents: number;
  maxGrade: number;
  minGrade: number;
  passCount: number;
  passRate: number;
}

// Interface pour les statistiques d'un étudiant
interface StudentStatistics {
  average: number;
  rank: number;
  classAverage: number;
}

// Interface pour un bulletin détaillé d'étudiant
interface DetailedStudentBulletin {
  overallAverage: number;
  rank: number;
  classAverage: number;
  subjectAverages: { [subjectId: number]: number };
  hasGrades: boolean;
}

// Interface du contexte
interface BulletinCalculationContextType {
  classStatistics: ClassStatistics | null;
  studentStatistics: { [studentId: number]: StudentStatistics };
  studentBulletins: { [studentId: number]: DetailedStudentBulletin };
  loading: boolean;
  error: string | null;
  fetchClassStatistics: (classId: number, periodId: number) => Promise<void>;
  fetchStudentStatistics: (studentId: number, classId: number, periodId: number) => Promise<void>;
  fetchStudentBulletin: (studentId: number, classId: number, periodId: number) => Promise<void>;
  clearStatistics: () => void;
}

// Créer le contexte
const BulletinCalculationContext = createContext<BulletinCalculationContextType>({
  classStatistics: null,
  studentStatistics: {},
  studentBulletins: {},
  loading: false,
  error: null,
  fetchClassStatistics: async () => {},
  fetchStudentStatistics: async () => {},
  fetchStudentBulletin: async () => {},
  clearStatistics: () => {},
});

// Provider
export const BulletinCalculationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classStatistics, setClassStatistics] = useState<ClassStatistics | null>(null);
  const [studentStatistics, setStudentStatistics] = useState<{ [studentId: number]: StudentStatistics }>({});
  const [studentBulletins, setStudentBulletins] = useState<{ [studentId: number]: DetailedStudentBulletin }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassStatistics = useCallback(async (classId: number, periodId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bulletins/calculations/class/${classId}/period/${periodId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClassStatistics(data);
      } else {
        throw new Error('Erreur lors de la récupération des statistiques de classe');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur fetchClassStatistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentStatistics = useCallback(async (studentId: number, classId: number, periodId: number) => {
    try {
      const response = await fetch(`/api/bulletins/calculations/student/${studentId}/class/${classId}/period/${periodId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentStatistics(prev => ({
          ...prev,
          [studentId]: data
        }));
      } else {
        throw new Error(`Erreur lors de la récupération des statistiques pour l'étudiant ${studentId}`);
      }
    } catch (err) {
      console.error(`Erreur fetchStudentStatistics pour l'étudiant ${studentId}:`, err);
    }
  }, []);

  const fetchStudentBulletin = useCallback(async (studentId: number, classId: number, periodId: number) => {
    try {
      const response = await fetch(`/api/bulletins/calculations/bulletin/student/${studentId}/class/${classId}/period/${periodId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudentBulletins(prev => ({
          ...prev,
          [studentId]: data
        }));
      } else {
        throw new Error(`Erreur lors de la récupération du bulletin pour l'étudiant ${studentId}`);
      }
    } catch (err) {
      console.error(`Erreur fetchStudentBulletin pour l'étudiant ${studentId}:`, err);
    }
  }, []);

  const clearStatistics = useCallback(() => {
    setClassStatistics(null);
    setStudentStatistics({});
    setStudentBulletins({});
    setError(null);
  }, []);

  return (
    <BulletinCalculationContext.Provider
      value={{
        classStatistics,
        studentStatistics,
        studentBulletins,
        loading,
        error,
        fetchClassStatistics,
        fetchStudentStatistics,
        fetchStudentBulletin,
        clearStatistics,
      }}
    >
      {children}
    </BulletinCalculationContext.Provider>
  );
};

export default BulletinCalculationContext;
