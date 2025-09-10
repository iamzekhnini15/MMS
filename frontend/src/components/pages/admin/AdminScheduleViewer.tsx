import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { ClassesContext } from '@/contexts/ClassesContext';
import { TeacherContext } from '@/contexts/TeacherContext';
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

const AdminScheduleViewer: React.FC = () => {
  const { classes, fetchAllClasses } = useContext(ClassesContext);
  const { teachers, fetchTeachers } = useContext(TeacherContext);

  const [selectedTab, setSelectedTab] = useState('classes');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllClasses();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClassSchedule = async (classId: string) => {
    if (!classId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/timetables/class/${classId}`);
      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer l'emploi du temps de cette classe",
        );
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

  const loadTeacherSchedule = async (teacherId: string) => {
    if (!teacherId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/timetables/teacher/${teacherId}`);
      if (!response.ok) {
        throw new Error(
          "Impossible de récupérer l'emploi du temps de ce professeur",
        );
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

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setScheduleEntries([]);
    setError(null);
    if (classId) {
      loadClassSchedule(classId);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setScheduleEntries([]);
    setError(null);
    if (teacherId) {
      loadTeacherSchedule(teacherId);
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setScheduleEntries([]);
    setError(null);
    setSelectedClassId('');
    setSelectedTeacherId('');
  };

  const getSelectedClassName = () => {
    if (!selectedClassId) return '';
    const selectedClass = classes?.find(
      (c) => c.idClass.toString() === selectedClassId,
    );
    return selectedClass
      ? `${selectedClass.name} (Niveau ${selectedClass.level})`
      : '';
  };

  const getSelectedTeacherName = () => {
    if (!selectedTeacherId) return '';
    const selectedTeacher = teachers?.find(
      (t) => t.idTeacher.toString() === selectedTeacherId,
    );
    return selectedTeacher
      ? `${selectedTeacher.user.firstname} ${selectedTeacher.user.lastname}`
      : '';
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Consultation des Emplois du Temps
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
            Consultez les horaires des classes et des professeurs
          </p>
        </div>
        <div className="self-center sm:self-auto">
          <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary dark:text-blue-400" />
        </div>
      </div>

      {/* Sélecteur */}
      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sélectionner un emploi du temps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Professeurs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classes" className="mt-4">
              <div className="space-y-4">
                <Select
                  value={selectedClassId}
                  onValueChange={handleClassChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((classItem) => (
                      <SelectItem
                        key={classItem.idClass}
                        value={classItem.idClass.toString()}
                      >
                        {classItem.name} - Niveau {classItem.level} (
                        {classItem.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClassId && (
                  <div className="text-sm text-muted-foreground">
                    Classe sélectionnée :{' '}
                    <span className="font-medium">
                      {getSelectedClassName()}
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="teachers" className="mt-4">
              <div className="space-y-4">
                <Select
                  value={selectedTeacherId}
                  onValueChange={handleTeacherChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un professeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.idTeacher}
                        value={teacher.idTeacher.toString()}
                      >
                        {teacher.user.firstname} {teacher.user.lastname} -{' '}
                        {teacher.specialities}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeacherId && (
                  <div className="text-sm text-muted-foreground">
                    Professeur sélectionné :{' '}
                    <span className="font-medium">
                      {getSelectedTeacherName()}
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Erreur</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Emploi du temps */}
      {(selectedClassId || selectedTeacherId) && !error && (
        <ScheduleViewer
          entries={scheduleEntries}
          title={
            selectedTab === 'classes'
              ? `Emploi du temps - ${getSelectedClassName()}`
              : `Emploi du temps - ${getSelectedTeacherName()}`
          }
          subtitle={
            selectedTab === 'classes'
              ? 'Horaires de la classe'
              : 'Horaires du professeur'
          }
          loading={loading}
          showClass={selectedTab === 'teachers'} // Montrer les classes pour les vues professeur
        />
      )}

      {/* Message d'accueil */}
      {!selectedClassId && !selectedTeacherId && !error && (
        <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-muted-foreground dark:text-gray-300 mb-2">
              Sélectionnez un emploi du temps à consulter
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
              Choisissez une classe ou un professeur dans les onglets ci-dessus
              pour voir son emploi du temps.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminScheduleViewer;
