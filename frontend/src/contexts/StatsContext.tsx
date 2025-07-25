import { createContext, useState, ReactNode, useCallback } from 'react';

interface ClassStats {
  classId: number;
  studentCount: number;
  subjectCount: number;
  evaluationCount: number;
  averageGrade: number;
}

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  totalEvaluations: number;
  averageGrade: number;
  monthlyEvaluations: number;
}

interface StatsContextType {
  classStats: ClassStats[] | null;
  teacherStats: TeacherStats | null;
  loading: boolean;
  error: string | null;
  fetchClassStats: (classIds: number[]) => Promise<void>;
  fetchTeacherStats: (teacherId: number) => Promise<void>;
  getStudentCountForClass: (classId: number) => number;
}

const defaultStatsContext: StatsContextType = {
  classStats: null,
  teacherStats: null,
  loading: false,
  error: null,
  fetchClassStats: async () => {},
  fetchTeacherStats: async () => {},
  getStudentCountForClass: () => 0,
};

const StatsContext = createContext<StatsContextType>(defaultStatsContext);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [classStats, setClassStats] = useState<ClassStats[] | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassStats = useCallback(async (classIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const statsPromises = classIds.map(async (classId) => {
        // Fetch student count
        const studentsResponse = await fetch(`/api/students/class/${classId}`);
        const students = studentsResponse.ok
          ? await studentsResponse.json()
          : [];

        // For now, we'll use placeholder data for evaluations since we need teacherId
        // This should be updated when we have the teacher context available
        const evaluationCount = 0; // Placeholder

        // Calculate average grade (placeholder - would need actual grades endpoint)
        // For now, we'll use a placeholder calculation
        const averageGrade = 85; // Placeholder

        return {
          classId,
          studentCount: students.length || 0,
          subjectCount: 5, // Placeholder - would need subjects endpoint
          evaluationCount,
          averageGrade,
        };
      });

      const stats = await Promise.all(statsPromises);
      setClassStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherStats = useCallback(
    async (teacherId: number) => {
      setLoading(true);
      setError(null);
      try {
        // Fetch teacher's evaluations
        const evaluationsResponse = await fetch(
          `/api/evaluations/teacher/${teacherId}`,
        );
        const evaluations = evaluationsResponse.ok
          ? await evaluationsResponse.json()
          : [];

        // Calculate monthly evaluations (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyEvaluations = evaluations.filter(
          (evaluation: { evaluationDate: string }) => {
            const evalDate = new Date(evaluation.evaluationDate);
            return (
              evalDate.getMonth() === currentMonth &&
              evalDate.getFullYear() === currentYear
            );
          },
        ).length;

        // Calculate totals from classStats if available
        const totalStudents =
          classStats?.reduce((sum, stat) => sum + stat.studentCount, 0) || 0;
        const totalClasses = classStats?.length || 0;
        const averageGrade = classStats?.length
          ? classStats.reduce((sum, stat) => sum + stat.averageGrade, 0) /
            classStats.length
          : 0;

        setTeacherStats({
          totalClasses,
          totalStudents,
          totalEvaluations: evaluations.length || 0,
          averageGrade: Math.round(averageGrade),
          monthlyEvaluations,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [classStats],
  );

  const getStudentCountForClass = useCallback(
    (classId: number): number => {
      const classStat = classStats?.find((stat) => stat.classId === classId);
      return classStat?.studentCount || 0;
    },
    [classStats],
  );

  const value: StatsContextType = {
    classStats,
    teacherStats,
    loading,
    error,
    fetchClassStats,
    fetchTeacherStats,
    getStudentCountForClass,
  };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
};

export default StatsContext;
