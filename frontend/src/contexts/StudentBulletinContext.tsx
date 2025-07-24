import React, { createContext, useContext, useState, useCallback } from 'react';

export interface StudentBulletin {
  idBulletin: number;
  student: {
    idStudent: number;
    user: {
      firstname: string;
      lastname: string;
    };
  };
  bulletinPeriod: {
    idPeriod: number;
    name: string;
  };
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  generalComment?: string;
  pdfFilePath: string;
  isVisible: boolean;
  generatedAt: string;
  generatedBy: {
    idUser: number;
    firstname: string;
    lastname: string;
  };
}

export interface DetailedStudentBulletin {
  idBulletin: number;
  studentId: number;
  studentName: string;
  className: string;
  periodName: string;
  academicYear: string;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  generalComment?: string;
  pdfFilePath?: string;
  isVisible: boolean;
  generatedAt: string;
  subjectGrades: SubjectGradeDetail[];
}

export interface SubjectGradeDetail {
  subjectName: string;
  average: number;
  coefficient: number;
  weightedAverage: number;
  evaluationGrades: EvaluationGradeDto[];
}

export interface EvaluationGradeDto {
  idGrade: number;
  evaluationId: number;
  evaluationTitle: string;
  maxScore: number;
  studentId: number;
  studentName: string;
  score: number;
  includeInCalculation: boolean;
  status: string;
  comment?: string;
  gradedAt: string;
  gradedById: number;
  gradedByName: string;
  percentage: number;
}

interface StudentBulletinContextType {
  bulletins: StudentBulletin[];
  loading: boolean;
  error: string | null;
  generateBulletinsForClass: (classId: number, periodId: number) => Promise<StudentBulletin[]>;
  getBulletinsByClassAndPeriod: (classId: number, periodId: number) => Promise<StudentBulletin[]>;
  getBulletinByStudentAndPeriod: (studentId: number, periodId: number) => Promise<StudentBulletin | null>;
  getDetailedBulletin: (studentId: number, periodId: number) => Promise<DetailedStudentBulletin | null>;
  updateBulletinComment: (bulletinId: number, comment: string) => Promise<StudentBulletin>;
  toggleBulletinVisibility: (bulletinId: number) => Promise<StudentBulletin>;
  makeAllBulletinsVisible: (classId: number, periodId: number) => Promise<StudentBulletin[]>;
  hideAllBulletins: (classId: number, periodId: number) => Promise<StudentBulletin[]>;
  bulletinsExist: (classId: number, periodId: number) => Promise<boolean>;
}

const StudentBulletinContext = createContext<StudentBulletinContextType | undefined>(undefined);

export const useStudentBulletin = () => {
  const context = useContext(StudentBulletinContext);
  if (!context) {
    throw new Error('useStudentBulletin must be used within a StudentBulletinProvider');
  }
  return context;
};

export const StudentBulletinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bulletins, setBulletins] = useState<StudentBulletin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBulletinsForClass = async (classId: number, periodId: number): Promise<StudentBulletin[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/generate/class/${classId}/period/${periodId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la génération des bulletins: ${response.status}`);
      }

      const generatedBulletins: StudentBulletin[] = await response.json();
      setBulletins(generatedBulletins);
      return generatedBulletins;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des bulletins';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBulletinsByClassAndPeriod = async (classId: number, periodId: number): Promise<StudentBulletin[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/class/${classId}/period/${periodId}`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des bulletins: ${response.status}`);
      }

      const bulletinsList: StudentBulletin[] = await response.json();
      setBulletins(bulletinsList);
      return bulletinsList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des bulletins';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBulletinByStudentAndPeriod = async (studentId: number, periodId: number): Promise<StudentBulletin | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/student/${studentId}/period/${periodId}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du bulletin: ${response.status}`);
      }

      const bulletin: StudentBulletin = await response.json();
      return bulletin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du bulletin';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDetailedBulletin = useCallback(async (studentId: number, periodId: number): Promise<DetailedStudentBulletin | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching bulletin for student ${studentId}, period ${periodId}`);
      
      const response = await fetch(`/api/bulletins/detailed/student/${studentId}/period/${periodId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Ajouter timeout pour éviter les requêtes qui traînent
        signal: AbortSignal.timeout(10000), // 10 secondes
      });

      console.log('Response status:', response.status);

      if (response.status === 404) {
        console.log('Bulletin not found');
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du bulletin détaillé: ${response.status} ${response.statusText}`);
      }

      const detailedBulletin: DetailedStudentBulletin = await response.json();
      console.log('Bulletin loaded successfully:', detailedBulletin.studentName);
      return detailedBulletin;
    } catch (err) {
      console.error('Error in getDetailedBulletin:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        const errorMessage = 'Timeout lors de la récupération du bulletin';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du bulletin détaillé';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBulletinComment = async (bulletinId: number, comment: string): Promise<StudentBulletin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/${bulletinId}/comment?comment=${encodeURIComponent(comment)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour du commentaire: ${response.status}`);
      }

      const updatedBulletin: StudentBulletin = await response.json();
      
      // Update the bulletin in the list
      setBulletins(prev => prev.map(b => 
        b.idBulletin === bulletinId ? updatedBulletin : b
      ));

      return updatedBulletin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du commentaire';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleBulletinVisibility = async (bulletinId: number): Promise<StudentBulletin> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/${bulletinId}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du changement de visibilité: ${response.status}`);
      }

      const updatedBulletin: StudentBulletin = await response.json();
      
      // Update the bulletin in the list
      setBulletins(prev => prev.map(b => 
        b.idBulletin === bulletinId ? updatedBulletin : b
      ));

      return updatedBulletin;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de visibilité';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const makeAllBulletinsVisible = async (classId: number, periodId: number): Promise<StudentBulletin[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/make-visible/class/${classId}/period/${periodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise en visibilité: ${response.status}`);
      }

      const updatedBulletins: StudentBulletin[] = await response.json();
      setBulletins(updatedBulletins);
      return updatedBulletins;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise en visibilité';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const hideAllBulletins = async (classId: number, periodId: number): Promise<StudentBulletin[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletins/hide-all/class/${classId}/period/${periodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du masquage: ${response.status}`);
      }

      const updatedBulletins: StudentBulletin[] = await response.json();
      setBulletins(updatedBulletins);
      return updatedBulletins;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du masquage';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulletinsExist = async (classId: number, periodId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bulletins/exists/class/${classId}/period/${periodId}`);

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification: ${response.status}`);
      }

      const exists: boolean = await response.json();
      return exists;
    } catch (err) {
      console.error('Erreur lors de la vérification des bulletins:', err);
      return false;
    }
  };

  const value: StudentBulletinContextType = {
    bulletins,
    loading,
    error,
    generateBulletinsForClass,
    getBulletinsByClassAndPeriod,
    getBulletinByStudentAndPeriod,
    getDetailedBulletin,
    updateBulletinComment,
    toggleBulletinVisibility,
    makeAllBulletinsVisible,
    hideAllBulletins,
    bulletinsExist,
  };

  return (
    <StudentBulletinContext.Provider value={value}>
      {children}
    </StudentBulletinContext.Provider>
  );
};

export default StudentBulletinContext;
