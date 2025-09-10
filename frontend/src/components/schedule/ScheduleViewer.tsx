import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ClockIcon,
  UserIcon,
  MapPinIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

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

interface ScheduleViewerProps {
  entries: ScheduleEntry[];
  title: string;
  subtitle?: string;
  loading?: boolean;
  showClass?: boolean; // Pour les vues admin/teacher qui montrent plusieurs classes
}

const DAYS_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
const DAYS_FR = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

const ScheduleViewer: React.FC<ScheduleViewerProps> = ({
  entries,
  title,
  subtitle,
  loading = false,
  showClass = false,
}) => {
  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grouper les entrées par jour
  const entriesByDay = entries.reduce(
    (acc, entry) => {
      const day = entry.timeSlot.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(entry);
      return acc;
    },
    {} as Record<string, ScheduleEntry[]>,
  );

  // Trier les entrées de chaque jour par heure de début
  Object.keys(entriesByDay).forEach((day) => {
    entriesByDay[day].sort((a, b) =>
      a.timeSlot.startTime.localeCompare(b.timeSlot.startTime),
    );
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        <div className="self-center sm:self-auto">
          <ClockIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary dark:text-blue-400" />
        </div>
      </div>

      {/* Emploi du temps */}
      {entries.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <ClockIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-muted-foreground dark:text-gray-300 mb-2">
              Aucun cours programmé
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
              Il n'y a actuellement aucun cours dans cet emploi du temps.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS_ORDER.filter((day) => entriesByDay[day]).map((day) => (
            <Card
              key={day}
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-primary dark:text-blue-400" />
                  {DAYS_FR[day as keyof typeof DAYS_FR]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entriesByDay[day].map((entry) => (
                  <div
                    key={entry.idTimetableEntry}
                    className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700"
                  >
                    {/* Horaire */}
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {entry.timeSlot.startTime} - {entry.timeSlot.endTime}
                      </span>
                      {entry.timeSlot.name && (
                        <Badge variant="outline" className="text-xs">
                          {entry.timeSlot.name}
                        </Badge>
                      )}
                    </div>

                    {/* Matière */}
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpenIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {entry.course.name}
                      </span>
                    </div>

                    {/* Professeur */}
                    <div className="flex items-center gap-2 mb-2">
                      <UserIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {entry.teacher.firstname} {entry.teacher.lastname}
                      </span>
                    </div>

                    {/* Salle */}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {entry.classroom.name}
                        {entry.classroom.location && (
                          <span className="text-muted-foreground">
                            {' '}
                            - {entry.classroom.location}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Classe (si affiché) */}
                    {showClass && (
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-orange-500" />
                        <Badge variant="secondary" className="text-xs">
                          {entry.classEntity.name} (Niveau{' '}
                          {entry.classEntity.level})
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleViewer;
