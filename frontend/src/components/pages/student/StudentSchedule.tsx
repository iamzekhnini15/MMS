import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { TimetableContext } from '@/contexts/TimetableContext';
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

const StudentSchedule: React.FC = () => {
  const { authenticatedUser } = useContext(UserContext);
  const { fetchTimetableForClass } = useContext(TimetableContext);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentSchedule = async () => {
      if (!authenticatedUser?.idStudent) {
        setError('Informations étudiant manquantes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer les informations de l'étudiant pour avoir sa classe
        const studentResponse = await fetch(
          `/api/students/${authenticatedUser.idStudent}`,
          {
            headers: {
              Authorization: `${authenticatedUser.token}`,
            },
          },
        );

        if (!studentResponse.ok) {
          throw new Error(
            "Impossible de récupérer les informations de l'étudiant",
          );
        }

        const studentData = await studentResponse.json();

        if (!studentData.classEntity?.idClass) {
          setError('Aucune classe assignée');
          setLoading(false);
          return;
        }

        // Récupérer l'emploi du temps de la classe
        const entries = await fetchTimetableForClass(
          studentData.classEntity.idClass,
        );

        // Convertir les TimetableEntry du backend en ScheduleEntry attendu par le
        // composant ScheduleViewer.
        const mapped = (entries || []).map((e) => {
          const teacherFull = e.teacherName || '';
          const parts = teacherFull.split(' ');
          const firstname = parts[0] || '';
          const lastname = parts.slice(1).join(' ') || '';

          return {
            idTimetableEntry: e.idEntry,
            timeSlot: {
              dayOfWeek: e.dayOfWeek,
              startTime: e.startTime,
              endTime: e.endTime,
              name: '',
            },
            course: { name: e.courseName || '' },
            teacher: { firstname, lastname },
            classroom: { name: e.classroomName || '', location: '' },
            classEntity: { name: '', level: 0 },
          };
        });

        setScheduleEntries(mapped);
      } catch (err) {
        console.error("Erreur lors du chargement de l'emploi du temps:", err);
        setError(
          err instanceof Error ? err.message : 'Erreur lors du chargement',
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudentSchedule();
  }, [authenticatedUser, fetchTimetableForClass]);

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
      showClass={false}
    />
  );
};

export default StudentSchedule;
