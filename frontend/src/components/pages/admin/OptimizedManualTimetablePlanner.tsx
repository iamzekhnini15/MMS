import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
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
  X,
  Info,
  Loader2,
} from 'lucide-react';

import { ClassesContext } from '../../../contexts/ClassesContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import {
  TimetableContext,
  ManualTimetableRequest,
  ManualTimetableEntry,
  BulkAvailabilityRequest,
  TimeSlotAvailability,
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

const OptimizedManualTimetablePlanner: React.FC = () => {
  const { classes } = useContext(ClassesContext);
  const { courses } = useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);
  const {
    timeSlots,
    fetchTimeSlots,
    createManualTimetable,
    checkBulkAvailability,
  } = useContext(TimetableContext);

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
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // États pour la nouvelle approche optimisée
  const [availabilityData, setAvailabilityData] = useState<{
    [timeSlotId: number]: TimeSlotAvailability;
  }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

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

        // Reset assignements si on change de classe
        setFormData((prev) => ({
          ...prev,
          courseAssignments: [],
          scheduledEntries: [],
        }));
        setAvailabilityData({});
      }
    }
  }, [formData.classId, courses, classes]);

  // Charger les professeurs éligibles pour chaque cours
  useEffect(() => {
    if (availableCourses.length > 0 && teachers) {
      const eligible: { [courseId: number]: Teacher[] } = {};
      availableCourses.forEach((course) => {
        eligible[course.idCourse] = teachers;
      });
      setEligibleTeachers(eligible);
    }
  }, [availableCourses, teachers]);

  // Fonction optimisée pour charger toutes les disponibilités en une fois
  const loadAvailabilityForCourse = useCallback(
    async (courseAssignment: CourseAssignment) => {
      if (
        !formData.classId ||
        !timeSlots ||
        !courseAssignment.teacherId ||
        !courseAssignment.classroomId
      ) {
        return;
      }

      setLoadingAvailability(true);

      try {
        const request: BulkAvailabilityRequest = {
          classId: formData.classId,
          courseId: courseAssignment.courseId,
          teacherId: courseAssignment.teacherId,
          classroomId: courseAssignment.classroomId,
          timeSlotIds: timeSlots.map((slot) => slot.idTimeSlot),
        };

        const response = await checkBulkAvailability(request);
        setAvailabilityData(response.availabilities);
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
        // En cas d'erreur, marquer tous les créneaux comme indisponibles
        const errorData: { [timeSlotId: number]: TimeSlotAvailability } = {};
        timeSlots.forEach((slot) => {
          errorData[slot.idTimeSlot] = {
            available: false,
            reason: 'Erreur lors de la vérification',
            conflictType: 'NONE',
          };
        });
        setAvailabilityData(errorData);
      } finally {
        setLoadingAvailability(false);
      }
    },
    [formData.classId, timeSlots, checkBulkAvailability],
  );

  // Recharger les disponibilités quand le cours sélectionné change
  useEffect(() => {
    if (selectedCourseForScheduling) {
      loadAvailabilityForCourse(selectedCourseForScheduling);
    }
  }, [
    selectedCourseForScheduling,
    formData.scheduledEntries,
    loadAvailabilityForCourse,
  ]);

  const isFormValid = () => {
    return (
      formData.classId &&
      formData.scheduledEntries.length > 0 &&
      formData.courseAssignments.every(
        (assignment) => assignment.teacherId && assignment.classroomId,
      )
    );
  };

  const addCourseAssignment = () => {
    if (availableCourses.length === 0) return;

    const unassignedCourses = availableCourses.filter(
      (course) =>
        !formData.courseAssignments.some(
          (assignment) => assignment.courseId === course.idCourse,
        ),
    );

    if (unassignedCourses.length === 0) return;

    const newCourse = unassignedCourses[0];
    const newAssignment: CourseAssignment = {
      courseId: newCourse.idCourse,
      courseName: newCourse.name,
      teacherId: 0,
      teacherName: '',
      classroomId: null,
      classroomName: '',
    };

    setFormData((prev) => ({
      ...prev,
      courseAssignments: [...prev.courseAssignments, newAssignment],
    }));
  };

  const removeCourseAssignment = (courseId: number) => {
    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.filter(
        (assignment) => assignment.courseId !== courseId,
      ),
      scheduledEntries: prev.scheduledEntries.filter(
        (entry) => entry.courseAssignment.courseId !== courseId,
      ),
    }));
  };

  const updateCourseSelection = (assignmentIndex: number, courseId: string) => {
    const selectedCourse = availableCourses.find(
      (c) => c.idCourse === parseInt(courseId),
    );
    if (!selectedCourse) return;

    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.map((assignment, index) =>
        index === assignmentIndex
          ? {
              ...assignment,
              courseId: selectedCourse.idCourse,
              courseName: selectedCourse.name,
              teacherId: 0,
              teacherName: '',
              classroomId: null,
              classroomName: '',
            }
          : assignment,
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

  const scheduleEntry = (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ) => {
    const timeSlot = timeSlots?.find((ts) => ts.idTimeSlot === timeSlotId);
    if (!timeSlot) return;

    // Vérifier s'il y a déjà une entrée pour cette classe à ce créneau
    const existingEntry = formData.scheduledEntries.find(
      (entry) => entry.timeSlotId === timeSlotId,
    );

    if (existingEntry) {
      alert('Un cours est déjà programmé à ce créneau pour cette classe');
      return;
    }

    // Créer l'entrée programmée
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
    setAvailabilityData({}); // Reset pour forcer le rechargement
  };

  const removeScheduledEntry = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduledEntries: prev.scheduledEntries.filter(
        (e) => e.tempId !== tempId,
      ),
    }));
  };

  const groupTimeSlotsByDay = useCallback(() => {
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
  }, [timeSlots]);

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
    if (!formData.classId || formData.scheduledEntries.length === 0) {
      alert('Veuillez sélectionner une classe et programmer au moins un cours');
      return;
    }

    try {
      setIsCreating(true);

      const entries: ManualTimetableEntry[] = formData.scheduledEntries.map(
        (entry) => ({
          classId: formData.classId!,
          courseId: entry.courseAssignment.courseId,
          teacherId: entry.courseAssignment.teacherId!,
          classroomId: entry.courseAssignment.classroomId!,
          timeSlotId: entry.timeSlotId,
        }),
      );

      const request: ManualTimetableRequest = {
        name: `Emploi du temps ${formData.className} - ${new Date().toLocaleDateString()}`,
        description: `Emploi du temps créé manuellement pour la classe ${formData.className}`,
        entries,
      };

      await createManualTimetable(request);
      alert('Emploi du temps créé avec succès !');

      // Reset du formulaire
      setFormData({
        classId: null,
        className: '',
        startDate: '',
        endDate: '',
        courseAssignments: [],
        scheduledEntries: [],
      });
      setAvailabilityData({});
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error instanceof Error && error.message.includes('400')) {
        try {
          const errorData = JSON.parse(
            error.message.replace('Erreur API ', ''),
          );
          if (errorData.error && Array.isArray(errorData.error)) {
            setValidationErrors(errorData.error);
            setShowValidationErrors(true);
          } else {
            alert("Erreur lors de la création de l'emploi du temps");
          }
        } catch {
          alert("Erreur lors de la création de l'emploi du temps");
        }
      } else {
        alert("Erreur lors de la création de l'emploi du temps");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const groupedTimeSlots = useMemo(
    () => groupTimeSlotsByDay(),
    [groupTimeSlotsByDay],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Planificateur Manuel d'Emploi du Temps (Optimisé)
          </CardTitle>
          <CardDescription>
            Version optimisée avec vérification groupée des conflits pour une
            meilleure performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection de la classe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">Classe *</Label>
              <Select
                value={formData.classId?.toString() || ''}
                onValueChange={(value) => {
                  const selectedClass = classes?.find(
                    (c) => c.idClass === parseInt(value),
                  );
                  setFormData((prev) => ({
                    ...prev,
                    classId: parseInt(value),
                    className: selectedClass ? selectedClass.name : '',
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((classItem) => (
                    <SelectItem
                      key={classItem.idClass}
                      value={classItem.idClass.toString()}
                    >
                      {classItem.name} - Niveau {classItem.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuration des cours */}
          {formData.classId && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Configuration des Cours</h3>
                <Button onClick={addCourseAssignment} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un cours
                </Button>
              </div>

              <div className="space-y-4">
                {formData.courseAssignments.map((assignment, index) => (
                  <Card key={`${assignment.courseId}-${index}`} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5" />
                        <Select
                          value={assignment.courseId.toString()}
                          onValueChange={(value) =>
                            updateCourseSelection(index, value)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sélectionner un cours" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCourses
                              .filter(
                                (course) =>
                                  !formData.courseAssignments.some(
                                    (a, i) =>
                                      a.courseId === course.idCourse &&
                                      i !== index,
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

                      <div className="flex gap-2">
                        {selectedCourseForScheduling?.courseId ===
                        assignment.courseId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCourseForScheduling(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Annuler
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={
                              !assignment.teacherId || !assignment.classroomId
                            }
                            onClick={() =>
                              setSelectedCourseForScheduling(assignment)
                            }
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Programmer
                          </Button>
                        )}
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
                        <Label className="text-sm">Salle *</Label>
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

          {/* Planification optimisée des créneaux */}
          {selectedCourseForScheduling && (
            <OptimizedTimeSlotScheduler
              courseAssignment={selectedCourseForScheduling}
              timeSlots={groupedTimeSlots}
              availabilityData={availabilityData}
              loadingAvailability={loadingAvailability}
              onSchedule={scheduleEntry}
              onCancel={() => setSelectedCourseForScheduling(null)}
              getDayDisplayName={getDayDisplayName}
              scheduledEntries={formData.scheduledEntries}
            />
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

      {/* Afficher les erreurs de validation */}
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

// Composant optimisé pour la planification des créneaux
interface OptimizedTimeSlotSchedulerProps {
  courseAssignment: CourseAssignment;
  timeSlots: { [day: string]: TimeSlot[] };
  availabilityData: { [timeSlotId: number]: TimeSlotAvailability };
  loadingAvailability: boolean;
  onSchedule: (courseAssignment: CourseAssignment, timeSlotId: number) => void;
  onCancel: () => void;
  getDayDisplayName: (dayOfWeek: string) => string;
  scheduledEntries: ScheduledEntry[];
}

const OptimizedTimeSlotScheduler: React.FC<OptimizedTimeSlotSchedulerProps> = ({
  courseAssignment,
  timeSlots,
  availabilityData,
  loadingAvailability,
  onSchedule,
  onCancel,
  getDayDisplayName,
  scheduledEntries,
}) => {
  const getSlotButtonClass = (timeSlotId: number) => {
    // Vérifier si le créneau est déjà occupé par cette classe
    const isOccupied = scheduledEntries.some(
      (entry) => entry.timeSlotId === timeSlotId,
    );

    if (isOccupied) {
      return 'w-full text-xs p-2 h-auto bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    const availability = availabilityData[timeSlotId];

    if (!availability) {
      return 'w-full text-xs p-2 h-auto bg-gray-100 border border-gray-300';
    }

    if (availability.available) {
      return 'w-full text-xs p-2 h-auto bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
    } else {
      return 'w-full text-xs p-2 h-auto bg-red-100 border-red-300 text-red-700 cursor-not-allowed';
    }
  };

  const isSlotClickable = (timeSlotId: number) => {
    const isOccupied = scheduledEntries.some(
      (entry) => entry.timeSlotId === timeSlotId,
    );
    const availability = availabilityData[timeSlotId];
    return !isOccupied && availability?.available && !loadingAvailability;
  };

  const getSlotTooltip = (timeSlotId: number) => {
    const isOccupied = scheduledEntries.some(
      (entry) => entry.timeSlotId === timeSlotId,
    );

    if (isOccupied) {
      return 'Créneau déjà occupé par cette classe';
    }

    const availability = availabilityData[timeSlotId];

    if (!availability) {
      return 'Chargement des disponibilités...';
    }

    return availability.reason;
  };

  return (
    <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          Programmer: {courseAssignment.courseName}
          <Badge variant="secondary" className="ml-2">
            {courseAssignment.teacherName}
          </Badge>
          <Badge variant="outline" className="ml-2">
            {courseAssignment.classroomName}
          </Badge>
        </h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Annuler
        </Button>
      </div>

      {loadingAvailability && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-blue-800 text-sm">
              Chargement des disponibilités...
            </span>
          </div>
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800 font-medium text-sm">Légende:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span>Conflit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Occupé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Chargement</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(timeSlots).map(([day, slots]) => (
          <div key={day}>
            <h4 className="font-medium mb-2">{getDayDisplayName(day)}</h4>
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.idTimeSlot} className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className={getSlotButtonClass(slot.idTimeSlot)}
                    disabled={!isSlotClickable(slot.idTimeSlot)}
                    onClick={() =>
                      isSlotClickable(slot.idTimeSlot) &&
                      onSchedule(courseAssignment, slot.idTimeSlot)
                    }
                    title={getSlotTooltip(slot.idTimeSlot)}
                  >
                    <div className="text-center">
                      <div>
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OptimizedManualTimetablePlanner;
