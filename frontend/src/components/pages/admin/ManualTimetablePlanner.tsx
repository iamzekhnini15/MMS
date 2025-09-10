import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  GraduationCap,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// ValidationErrorDisplay was used previously for modal; errors are now shown inline
import { ClassesContext } from '../../../contexts/ClassesContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import {
  TimetableContext,
  ManualTimetableRequest,
  ManualTimetableEntry,
} from '../../../contexts/TimetableContext';
import { Course, Teacher } from '@/types';
import type { TimeSlot } from '../../../contexts/TimetableContext';

interface CourseAssignment {
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  classroomId: number | null;
  classroomName: string;
}

interface ScheduledEntry {
  tempId: string;
  courseAssignment: CourseAssignment;
  timeSlotId: number;
  timeSlotInfo: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    name: string;
  };
}

interface ManualPlannerFormData {
  classId: number | null;
  className: string;
  startDate: string;
  endDate: string;
  courseAssignments: CourseAssignment[];
  scheduledEntries: ScheduledEntry[];
}

const ManualTimetablePlanner: React.FC = () => {
  const { classes } = useContext(ClassesContext);
  const { courses } = useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);
  const { timeSlots, fetchTimeSlots, createManualTimetable } =
    useContext(TimetableContext);

  const [formData, setFormData] = useState<ManualPlannerFormData>({
    classId: null,
    className: '',
    startDate: '',
    endDate: '',
    courseAssignments: [],
    scheduledEntries: [],
  });

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [eligibleTeachers, setEligibleTeachers] = useState<{
    [courseId: number]: Teacher[];
  }>({});
  const [selectedCourseForScheduling, setSelectedCourseForScheduling] =
    useState<CourseAssignment | null>(null);
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Charger les timeSlots au démarrage
  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  // Mettre à jour les cours disponibles quand une classe est sélectionnée
  useEffect(() => {
    if (formData.classId && courses) {
      const selectedClass = classes?.find(
        (c) => c.idClass === formData.classId,
      );
      if (selectedClass) {
        const compatibleCourses = courses.filter(
          (course) => course.level === selectedClass.level.toString(),
        );
        setAvailableCourses(compatibleCourses);
        setFormData((prev) => ({
          ...prev,
          courseAssignments: [],
          scheduledEntries: [],
        }));
      }
    }
  }, [formData.classId, courses, classes]);

  // Mettre à jour les professeurs éligibles
  useEffect(() => {
    if (formData.courseAssignments.length > 0 && teachers) {
      const newEligibleTeachers: { [courseId: number]: Teacher[] } = {};

      formData.courseAssignments.forEach((assignment) => {
        const course = courses?.find((c) => c.idCourse === assignment.courseId);
        if (course && teachers) {
          const compatibleTeachers = teachers.filter(
            (teacher) =>
              teacher.specialities
                .toLowerCase()
                .includes(course.name.toLowerCase()) ||
              course.name
                .toLowerCase()
                .includes(teacher.specialities.toLowerCase()),
          );
          newEligibleTeachers[assignment.courseId] = compatibleTeachers;
        }
      });

      setEligibleTeachers(newEligibleTeachers);
    }
  }, [formData.courseAssignments, teachers, courses]);

  const handleClassSelection = (classId: string) => {
    const selectedClass = classes?.find((c) => c.idClass === parseInt(classId));
    if (selectedClass) {
      setFormData((prev) => ({
        ...prev,
        classId: selectedClass.idClass,
        className: selectedClass.name,
      }));
    }
  };

  const addCourseAssignment = (courseId: string) => {
    const course = availableCourses.find(
      (c) => c.idCourse === parseInt(courseId),
    );
    if (
      course &&
      !formData.courseAssignments.find((a) => a.courseId === course.idCourse)
    ) {
      setFormData((prev) => ({
        ...prev,
        courseAssignments: [
          ...prev.courseAssignments,
          {
            courseId: course.idCourse,
            courseName: course.name,
            teacherId: 0,
            teacherName: '',
            classroomId: null,
            classroomName: '',
          },
        ],
      }));
    }
  };

  const removeCourseAssignment = (courseId: number) => {
    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.filter(
        (a) => a.courseId !== courseId,
      ),
      scheduledEntries: prev.scheduledEntries.filter(
        (e) => e.courseAssignment.courseId !== courseId,
      ),
    }));
  };

  const updateCourseTeacher = (courseId: number, teacherId: string) => {
    const teacher = teachers?.find((t) => t.idTeacher === parseInt(teacherId));
    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.map((assignment) =>
        assignment.courseId === courseId
          ? {
              ...assignment,
              teacherId: teacher ? teacher.idTeacher : 0,
              teacherName: teacher
                ? `${teacher.user.firstname} ${teacher.user.lastname}`
                : '',
            }
          : assignment,
      ),
    }));
  };

  const updateCourseClassroom = (courseId: number, classroomId: string) => {
    const classroom = classrooms?.find(
      (c) => c.idClassroom === parseInt(classroomId),
    );
    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.map((assignment) =>
        assignment.courseId === courseId
          ? {
              ...assignment,
              classroomId: classroom ? classroom.idClassroom : null,
              classroomName: classroom ? classroom.name : '',
            }
          : assignment,
      ),
    }));
  };

  const checkConflicts = (
    timeSlotId: number,
    teacherId: number,
    classroomId: number | null,
  ): string[] => {
    const conflicts: string[] = [];

    // Vérifier les conflits de professeur
    const teacherConflict = formData.scheduledEntries.find(
      (entry) =>
        entry.timeSlotId === timeSlotId &&
        entry.courseAssignment.teacherId === teacherId,
    );
    if (teacherConflict) {
      conflicts.push(
        `Conflit: Le professeur est déjà assigné à "${teacherConflict.courseAssignment.courseName}" sur ce créneau`,
      );
    }

    // Vérifier les conflits de salle
    if (classroomId) {
      const classroomConflict = formData.scheduledEntries.find(
        (entry) =>
          entry.timeSlotId === timeSlotId &&
          entry.courseAssignment.classroomId === classroomId,
      );
      if (classroomConflict) {
        conflicts.push(
          `Conflit: La salle est déjà occupée par "${classroomConflict.courseAssignment.courseName}" sur ce créneau`,
        );
      }
    }

    return conflicts;
  };

  const scheduleEntry = (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ) => {
    const timeSlot = timeSlots?.find((ts) => ts.idTimeSlot === timeSlotId);
    if (!timeSlot) return;

    const conflicts = checkConflicts(
      timeSlotId,
      courseAssignment.teacherId,
      courseAssignment.classroomId,
    );
    if (conflicts.length > 0) {
      setConflictWarnings(conflicts);
      return;
    }

    const scheduledEntry: ScheduledEntry = {
      tempId: `${courseAssignment.courseId}-${timeSlotId}-${Date.now()}`,
      courseAssignment,
      timeSlotId,
      timeSlotInfo: {
        dayOfWeek: timeSlot.dayOfWeek,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        name: `${timeSlot.dayOfWeek} ${timeSlot.startTime}-${timeSlot.endTime}`,
      },
    };

    setFormData((prev) => ({
      ...prev,
      scheduledEntries: [...prev.scheduledEntries, scheduledEntry],
    }));

    setSelectedCourseForScheduling(null);
    setConflictWarnings([]);
  };

  const removeScheduledEntry = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduledEntries: prev.scheduledEntries.filter(
        (e) => e.tempId !== tempId,
      ),
    }));
  };

  const groupTimeSlotsByDay = () => {
    if (!timeSlots) return {};

    const grouped: { [day: string]: TimeSlot[] } = {};
    const dayOrder = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];

    timeSlots.forEach((slot) => {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = [];
      }
      grouped[slot.dayOfWeek].push(slot);
    });

    // Trier par jour et par heure
    dayOrder.forEach((day) => {
      if (grouped[day]) {
        grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    });

    return grouped;
  };

  const getDayDisplayName = (dayOfWeek: string): string => {
    const dayNames: { [key: string]: string } = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche',
    };
    return dayNames[dayOfWeek] || dayOfWeek;
  };

  const handleSaveTimetable = async () => {
    console.log('FormData avant validation:', formData);

    if (!formData.classId || formData.scheduledEntries.length === 0) {
      alert('Veuillez sélectionner une classe et programmer au moins un cours');
      return;
    }

    try {
      setIsCreating(true);

      // Créer les entrées pour l'API manuelle
      const entries: ManualTimetableEntry[] = formData.scheduledEntries.map(
        (entry) => ({
          classId: formData.classId!,
          courseId: entry.courseAssignment.courseId,
          teacherId: entry.courseAssignment.teacherId!,
          classroomId: entry.courseAssignment.classroomId!,
          timeSlotId: entry.timeSlotId,
        }),
      );

      console.log('Entries créées:', entries);

      const request: ManualTimetableRequest = {
        name: `Emploi du temps ${formData.className} - ${new Date().toLocaleDateString()}`,
        description: `Emploi du temps créé manuellement pour la classe ${formData.className}`,
        entries,
      };

      console.log('Request final:', request);

      await createManualTimetable(request);

      // Si on arrive ici, c'est que la création a réussi
      alert('Emploi du temps créé avec succès !');
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde:', error);

      // V\u00e9rifier les d\u00e9tails d'erreur structur\u00e9s
      if (
        typeof error === 'object' &&
        error !== null &&
        'errorDetails' in error
      ) {
        const errObj = error as { errorDetails?: unknown };
        const ed = errObj.errorDetails;
        if (typeof ed === 'object' && ed !== null && 'error' in ed) {
          const edTyped = ed as { error?: string };
          if (
            edTyped.error &&
            edTyped.error.includes('Conflits d\u00e9tect\u00e9s')
          ) {
            const conflictsMatch = edTyped.error.match(
              /Conflits d\u00e9tect\u00e9s dans l'emploi du temps : (.+)/,
            );
            if (conflictsMatch) {
              const conflictList = conflictsMatch[1].split('; ');
              setValidationErrors(conflictList);
              setShowValidationErrors(true);
              return; // Ne pas afficher l'alert par d\u00e9faut
            }
          }
        }
      }

      // Fallback: essayer de parser le message d'erreur si pas de d\u00e9tails structur\u00e9s
      if (error instanceof Error && error.message.includes('Erreur API')) {
        try {
          const errorMessageMatch = error.message.match(
            /Erreur API [^:]+: ({.+})/,
          );
          if (errorMessageMatch) {
            const backendResponse = JSON.parse(errorMessageMatch[1]);
            if (
              backendResponse &&
              typeof backendResponse === 'object' &&
              'error' in backendResponse &&
              typeof (backendResponse as { error?: string }).error ===
                'string' &&
              (backendResponse as { error?: string }).error?.includes(
                'Conflits d\u00e9tect\u00e9s',
              )
            ) {
              const conflictsMatch = (
                backendResponse as { error?: string }
              ).error?.match(
                /Conflits d\u00e9tect\u00e9s dans l'emploi du temps : (.+)/,
              );
              if (conflictsMatch) {
                const conflictList = conflictsMatch[1].split('; ');
                setValidationErrors(conflictList);
                setShowValidationErrors(true);
                return;
              }
            }
          }
        } catch (parseError) {
          console.error(
            "Erreur lors du parsing de l'erreur backend:",
            parseError,
          );
        }
      }

      // Autres types d'erreurs ou erreurs de parsing
      const message =
        error instanceof Error ? error.message : 'Erreur inconnue';
      alert("Erreur lors de la cr\u00e9ation de l'emploi du temps: " + message);
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = () => {
    return formData.classId && formData.scheduledEntries.length > 0;
  };

  const groupedTimeSlots = groupTimeSlotsByDay();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planificateur Manuel d'Emploi du Temps
          </CardTitle>
          <CardDescription>
            Créez un emploi du temps en plaçant manuellement chaque cours dans
            les créneaux horaires disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration de base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Classe *</Label>
              <Select
                onValueChange={handleClassSelection}
                value={formData.classId?.toString() || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((classe) => (
                    <SelectItem
                      key={classe.idClass}
                      value={classe.idClass.toString()}
                    >
                      {classe.name} (Niveau {classe.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Date de début *</Label>
              <input
                id="startDate"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="endDate">Date de fin *</Label>
              <input
                id="endDate"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Configuration des cours */}
          {formData.classId && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">
                  Courses et Professeurs
                </Label>
                <Select onValueChange={addCourseAssignment}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Ajouter un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses
                      .filter(
                        (course) =>
                          !formData.courseAssignments.find(
                            (a) => a.courseId === course.idCourse,
                          ),
                      )
                      .map((course) => (
                        <SelectItem
                          key={course.idCourse}
                          value={course.idCourse.toString()}
                        >
                          {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Liste des cours configurés */}
              <div className="space-y-3">
                {formData.courseAssignments.map((assignment) => (
                  <Card key={assignment.courseId} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{assignment.courseName}</Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedCourseForScheduling(assignment)
                          }
                          disabled={!assignment.teacherId}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Programmer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeCourseAssignment(assignment.courseId)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Professeur *</Label>
                        <Select
                          value={assignment.teacherId?.toString() || ''}
                          onValueChange={(value) =>
                            updateCourseTeacher(assignment.courseId, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner un professeur" />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleTeachers[assignment.courseId]?.map(
                              (teacher) => (
                                <SelectItem
                                  key={teacher.idTeacher}
                                  value={teacher.idTeacher.toString()}
                                >
                                  {teacher.user.firstname}{' '}
                                  {teacher.user.lastname}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Salle</Label>
                        <Select
                          value={assignment.classroomId?.toString() || ''}
                          onValueChange={(value) =>
                            updateCourseClassroom(assignment.courseId, value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner une salle" />
                          </SelectTrigger>
                          <SelectContent>
                            {classrooms?.map((classroom) => (
                              <SelectItem
                                key={classroom.idClassroom}
                                value={classroom.idClassroom.toString()}
                              >
                                {classroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Planification des créneaux */}
          {selectedCourseForScheduling && (
            <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  Programmer: {selectedCourseForScheduling.courseName}
                  <Badge variant="secondary" className="ml-2">
                    {selectedCourseForScheduling.teacherName}
                  </Badge>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourseForScheduling(null)}
                >
                  Annuler
                </Button>
              </div>

              {conflictWarnings.length > 0 && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">
                      Conflits détectés:
                    </span>
                  </div>
                  {conflictWarnings.map((warning, index) => (
                    <p key={index} className="text-red-700 text-sm mt-1">
                      {warning}
                    </p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(groupedTimeSlots).map(([day, slots]) => (
                  <div key={day}>
                    <h4 className="font-medium mb-2">
                      {getDayDisplayName(day)}
                    </h4>
                    <div className="space-y-2">
                      {slots.map((slot) => (
                        <Button
                          key={slot.idTimeSlot}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs p-2 h-auto"
                          onClick={() =>
                            scheduleEntry(
                              selectedCourseForScheduling,
                              slot.idTimeSlot,
                            )
                          }
                        >
                          <div className="text-center">
                            <div>
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Emploi du temps programmé */}
          {formData.scheduledEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Emploi du Temps Programmé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.scheduledEntries.map((entry) => (
                    <div
                      key={entry.tempId}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {getDayDisplayName(entry.timeSlotInfo.dayOfWeek)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {entry.timeSlotInfo.startTime} -{' '}
                            {entry.timeSlotInfo.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-medium">
                            {entry.courseAssignment.courseName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{entry.courseAssignment.teacherName}</span>
                        </div>
                        {entry.courseAssignment.classroomName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{entry.courseAssignment.classroomName}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeScheduledEntry(entry.tempId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bouton de sauvegarde */}
          <Button
            onClick={handleSaveTimetable}
            disabled={!isFormValid() || isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? 'Création en cours...' : "Créer l'Emploi du Temps"}
          </Button>
        </CardContent>
      </Card>

      {/* Afficher les erreurs de validation inline sous le bouton Créer */}
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Conflits détectés
                </p>
                <p className="text-xs text-red-600">
                  Veuillez corriger les conflits suivants avant de réessayer :
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowValidationErrors(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Fermer
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {validationErrors.map((err, idx) => (
              <li key={idx} className="text-sm text-red-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ManualTimetablePlanner;
