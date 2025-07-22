import { createContext, useState, ReactNode } from 'react';
import {
  Evaluation,
  EvaluationContextType,
  EvaluationGrade,
  BulkGradeInput,
} from '../types';

const defaultEvaluationContext: EvaluationContextType = {
  evaluations: null,
  evaluationGrades: null,
  loading: false,
  error: null,
  fetchTeacherEvaluations: async () => {},
  fetchEvaluationsByClass: async () => {},
  fetchEvaluationById: async () => null,
  createEvaluation: async () => {},
  updateEvaluation: async () => {},
  deleteEvaluation: async () => {},
  fetchGradesByEvaluation: async () => {},
  submitGrades: async () => {},
  updateGrade: async () => {},
  deleteGrade: async () => {},
  exportGrades: async () => new Blob(),
};

const EvaluationContext = createContext<EvaluationContextType>(
  defaultEvaluationContext,
);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[] | null>(null);
  const [evaluationGrades, setEvaluationGrades] = useState<
    EvaluationGrade[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherEvaluations = async (teacherId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/evaluations/teacher/${teacherId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teacher evaluations');
      }
      const data = await response.json();
      setEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationsByClass = async (classId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Pour l'instant, on peut utiliser une route alternative ou créer une route spécifique
      // Temporairement, utilisons la liste des évaluations visibles
      const response = await fetch(
        `/api/evaluations/visible/class/${classId}/period/1`,
      ); // period 1 par défaut
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations by class');
      }
      const data = await response.json();
      setEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createEvaluation = async (evaluation: Evaluation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/evaluations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation),
      });

      if (!response.ok) {
        throw new Error('Failed to create evaluation');
      }

      // Refresh evaluations after creation
      if (evaluation.teacherId) {
        await fetchTeacherEvaluations(evaluation.teacherId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluation = async (
    evaluationId: number,
    evaluation: Evaluation,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluation),
      });

      if (!response.ok) {
        throw new Error('Failed to update evaluation');
      }

      // Refresh evaluations after update
      if (evaluation.teacherId) {
        await fetchTeacherEvaluations(evaluation.teacherId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvaluation = async (evaluationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete evaluation');
      }

      // Remove the evaluation from local state
      setEvaluations((prev) =>
        prev
          ? prev.filter(
              (evaluation) => evaluation.idEvaluation !== evaluationId,
            )
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGradesByEvaluation = async (evaluationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/grades/evaluation/${evaluationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation grades');
      }
      const data = await response.json();
      console.log('📊 Grades fetched from API:', data);
      setEvaluationGrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const submitGrades = async (grades: BulkGradeInput) => {
    setLoading(true);
    setError(null);

    console.log('🚀 Starting grade submission:', grades);

    // MODE DÉVELOPPEMENT - simulation complète
    const isDevelopmentMode = false; // Changé à false pour tester l'API réelle

    if (isDevelopmentMode) {
      console.log(
        '🔧 Development Mode: Simulating successful grade submission',
      );
      console.log(
        '📊 Grades that would be saved:',
        JSON.stringify(grades, null, 2),
      );

      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('✅ Grade submission completed (simulated)');
      setLoading(false);
      return; // Succès simulé
    }

    // CODE NORMAL avec teacherId
    try {
      // TODO: Récupérer le teacherId du contexte d'auth ou du localStorage
      const teacherId = 1; // Valeur temporaire pour les tests

      const response = await fetch(
        `/api/grades/bulk-save?teacherId=${teacherId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(grades),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', response.status, errorText);
        throw new Error(
          `Failed to submit grades: ${response.status} - ${errorText}`,
        );
      }

      console.log('✅ Grades successfully saved to database');
      await fetchGradesByEvaluation(grades.evaluationId);
    } catch (err) {
      console.error('Error submitting grades:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // Relancer l'erreur
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationById = async (
    id: number,
  ): Promise<Evaluation | null> => {
    try {
      const response = await fetch(`/api/evaluations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  // Fonctions manquantes pour compatibilité
  const updateGrade = async () => {
    // TODO: Implémenter si nécessaire
  };

  const deleteGrade = async () => {
    // TODO: Implémenter si nécessaire
  };

  const value: EvaluationContextType = {
    evaluations,
    evaluationGrades,
    loading,
    error,
    fetchTeacherEvaluations,
    fetchEvaluationsByClass,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    fetchGradesByEvaluation,
    submitGrades,
    updateGrade,
    deleteGrade,
    exportGrades: async (evaluationId: number) => {
      try {
        const response = await fetch(
          `/api/grades/evaluation/${evaluationId}/export`,
        );
        if (!response.ok) {
          throw new Error('Failed to export grades');
        }
        return await response.blob();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    fetchEvaluationById,
  };

  return (
    <EvaluationContext.Provider value={value}>
      {children}
    </EvaluationContext.Provider>
  );
};

export default EvaluationContext;
