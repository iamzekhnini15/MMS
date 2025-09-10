import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/contexts/UserContext';
import ScheduleViewer from '@/components/schedule/ScheduleViewer';

interface ScheduleEntry {
  idTimetableEntry: number;
  timeSlot: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    name: string;
  };
  course: {
    name: string;
  };
  teacher: {
    firstname: string;
    lastname: string;
  };
  classroom: {
    name: string;
    location: string;
  };
  classEntity: {
    name: string;
    level: number;
  };
}

const TeacherSchedule: React.FC = () => {
  const { authenticatedUser } = useContext(UserContext);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeacherSchedule = async () => {
      if (!authenticatedUser?.idTeacher) {
        setError('Informations professeur manquantes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer l'emploi du temps du professeur
        const response = await fetch(
          `/api/timetables/teacher/${authenticatedUser.idTeacher}`,
          {
            headers: {
              Authorization: `${authenticatedUser.token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Impossible de récupérer votre emploi du temps');
        }

        const entries = await response.json();
        setScheduleEntries(entries || []);
      } catch (err) {
        console.error("Erreur lors du chargement de l'emploi du temps:", err);
        setError(
          err instanceof Error ? err.message : 'Erreur lors du chargement',
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeacherSchedule();
  }, [authenticatedUser]);

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Erreur</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ScheduleViewer
      entries={scheduleEntries}
      title="Mon Emploi du Temps"
      subtitle="Consultez votre planning de cours"
      loading={loading}
      showClass={true} // Les professeurs voient les classes qu'ils enseignent
    />
  );
};

export default TeacherSchedule;
