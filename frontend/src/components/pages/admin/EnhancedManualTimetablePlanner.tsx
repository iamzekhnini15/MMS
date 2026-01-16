import React, { useContext, useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';

import { ClassesContext } from '../../../contexts/ClassesContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import {
  TimetableContext,
  ManualTimetableRequest,
  ManualTimetableEntry,
  ConflictCheckRequest,
  ConflictCheckResponse,
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

interface ConflictInfo {
  [timeSlotId: number]: {
    [courseId: number]: ConflictCheckResponse;
  };
}

const EnhancedManualTimetablePlanner: React.FC = () => {
  const { classes } = useContext(ClassesContext);
  const { courses } = useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);
  const { timeSlots, fetchTimeSlots, createManualTimetable, checkConflicts } =
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
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  // Cache des conflits pour chaque créneau et cours
  const [conflictsCache, setConflictsCache] = useState<ConflictInfo>({});

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
        setConflictsCache({});
      }
    }
  }, [formData.classId, courses, classes]);

  // Charger les professeurs éligibles pour chaque cours
  useEffect(() => {
    if (availableCourses.length > 0 && teachers) {
      const eligible: { [courseId: number]: Teacher[] } = {};
      availableCourses.forEach((course) => {
        // Pour l'instant, on met tous les professeurs comme éligibles
        // TODO: Implémenter la logique de correspondance professeur-matière
        eligible[course.idCourse] = teachers;
      });
      setEligibleTeachers(eligible);
    }
  }, [availableCourses, teachers]);

  // Fonction pour vérifier les conflits en temps réel
  const checkConflictsRealTime = async (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ): Promise<ConflictCheckResponse> => {
    // Vérifier le cache d'abord
    if (conflictsCache[timeSlotId]?.[courseAssignment.courseId]) {
      return conflictsCache[timeSlotId][courseAssignment.courseId];
    }

    try {
      const request: ConflictCheckRequest = {
        classId: formData.classId!,
        courseId: courseAssignment.courseId,
        teacherId: courseAssignment.teacherId,
        classroomId: courseAssignment.classroomId || undefined,
        timeSlotId,
      };

      const response = await checkConflicts(request);
      
      // Mettre en cache le résultat
      setConflictsCache(prev => ({
        ...prev,
        [timeSlotId]: {
          ...prev[timeSlotId],
          [courseAssignment.courseId]: response,
        },
      }));

      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      return {
        hasConflicts: true,
        conflicts: ['Erreur lors de la vérification'],
        teacherUnavailable: false,
        classroomUnavailable: false,
      };
    }
  };

  // Invalider le cache des conflits quand les assignements changent
  useEffect(() => {
    setConflictsCache({});
  }, [formData.courseAssignments, formData.scheduledEntries]);

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

  const scheduleEntry = async (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ) => {
    if (!courseAssignment.teacherId || !courseAssignment.classroomId) {
      alert('Veuillez d\'abord assigner un professeur et une salle à ce cours');
      return;
    }

    const timeSlot = timeSlots?.find((ts) => ts.idTimeSlot === timeSlotId);
    if (!timeSlot) return;

    // Vérifier s'il y a déjà une entrée pour cette classe à ce créneau
    const existingEntry = formData.scheduledEntries.find(
      entry => entry.timeSlotId === timeSlotId
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

  // Vérifier si un créneau est disponible pour un cours
  const isTimeSlotAvailable = async (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ): Promise<{
    available: boolean;
    conflicts: ConflictCheckResponse | null;
  }> => {
    if (!courseAssignment.teacherId || !courseAssignment.classroomId) {
      return { available: false, conflicts: null };
    }

    // Vérifier s'il y a déjà une entrée pour cette classe à ce créneau
    const existingEntry = formData.scheduledEntries.find(
      entry => entry.timeSlotId === timeSlotId
    );
    
    if (existingEntry) {
      return { available: false, conflicts: null };
    }

    const conflicts = await checkConflictsRealTime(courseAssignment, timeSlotId);
    return {
      available: !conflicts.hasConflicts,
      conflicts,
    };
  };

  const handleSaveTimetable = async () => {
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
      setConflictsCache({});
      
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error instanceof Error && error.message.includes('400')) {
        try {
          const errorData = JSON.parse(error.message.replace('Erreur API ', ''));
          if (errorData.error && Array.isArray(errorData.error)) {
            setValidationErrors(errorData.error);
            setShowValidationErrors(true);
          } else {
            alert('Erreur lors de la création de l\'emploi du temps');
          }
        } catch {
          alert('Erreur lors de la création de l\'emploi du temps');
        }
      } else {
        alert('Erreur lors de la création de l\'emploi du temps');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const groupedTimeSlots = useMemo(() => groupTimeSlotsByDay(), [timeSlots]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planificateur Manuel d'Emploi du Temps</CardTitle>
          <CardDescription>
            Créez manuellement un emploi du temps en assignant les cours aux créneaux horaires.
            Les conflits sont détectés en temps réel.
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
                                      a.courseId === course.idCourse && i !== index,
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
                        {selectedCourseForScheduling?.courseId === assignment.courseId ? (
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
                            disabled={!assignment.teacherId || !assignment.classroomId}
                            onClick={() => setSelectedCourseForScheduling(assignment)}
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

          {/* Planification des créneaux avec vérification en temps réel */}
          {selectedCourseForScheduling && (
            <EnhancedTimeSlotScheduler
              courseAssignment={selectedCourseForScheduling}
              timeSlots={groupedTimeSlots}
              onSchedule={scheduleEntry}
              onCancel={() => setSelectedCourseForScheduling(null)}
              isTimeSlotAvailable={isTimeSlotAvailable}
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

// Composant pour la planification améliorée des créneaux
interface EnhancedTimeSlotSchedulerProps {
  courseAssignment: CourseAssignment;
  timeSlots: { [day: string]: TimeSlot[] };
  onSchedule: (courseAssignment: CourseAssignment, timeSlotId: number) => void;
  onCancel: () => void;
  isTimeSlotAvailable: (
    courseAssignment: CourseAssignment,
    timeSlotId: number,
  ) => Promise<{ available: boolean; conflicts: ConflictCheckResponse | null }>;
  getDayDisplayName: (dayOfWeek: string) => string;
  scheduledEntries: ScheduledEntry[];
}

const EnhancedTimeSlotScheduler: React.FC<EnhancedTimeSlotSchedulerProps> = ({
  courseAssignment,
  timeSlots,
  onSchedule,
  onCancel,
  isTimeSlotAvailable,
  getDayDisplayName,
  scheduledEntries,
}) => {
  const [slotAvailability, setSlotAvailability] = useState<{
    [timeSlotId: number]: { available: boolean; conflicts: ConflictCheckResponse | null };
  }>({});
  const [loadingSlots, setLoadingSlots] = useState<Set<number>>(new Set());

  // Vérifier la disponibilité de tous les créneaux
  useEffect(() => {
    const checkAllSlots = async () => {
      const allSlots = Object.values(timeSlots).flat();
      const availability: typeof slotAvailability = {};
      
      for (const slot of allSlots) {
        setLoadingSlots(prev => new Set([...prev, slot.idTimeSlot]));
        
        try {
          const result = await isTimeSlotAvailable(courseAssignment, slot.idTimeSlot);
          availability[slot.idTimeSlot] = result;
        } catch (error) {
          console.error('Erreur lors de la vérification du créneau:', slot.idTimeSlot, error);
          availability[slot.idTimeSlot] = { available: false, conflicts: null };
        } finally {
          setLoadingSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(slot.idTimeSlot);
            return newSet;
          });
        }
      }
      
      setSlotAvailability(availability);
    };

    checkAllSlots();
  }, [courseAssignment, timeSlots, isTimeSlotAvailable]);

  const getSlotButtonClass = (timeSlotId: number) => {
    const isLoading = loadingSlots.has(timeSlotId);
    const availability = slotAvailability[timeSlotId];
    
    // Vérifier si le créneau est déjà occupé par cette classe
    const isOccupied = scheduledEntries.some(entry => entry.timeSlotId === timeSlotId);
    
    if (isLoading) {
      return "w-full text-xs p-2 h-auto opacity-50 cursor-wait";
    }
    
    if (isOccupied) {
      return "w-full text-xs p-2 h-auto bg-gray-300 text-gray-500 cursor-not-allowed";
    }
    
    if (!availability) {
      return "w-full text-xs p-2 h-auto";
    }
    
    if (availability.available) {
      return "w-full text-xs p-2 h-auto bg-green-100 hover:bg-green-200 border-green-300 text-green-800";
    } else {
      return "w-full text-xs p-2 h-auto bg-red-100 border-red-300 text-red-700 cursor-not-allowed";
    }
  };

  const isSlotClickable = (timeSlotId: number) => {
    const availability = slotAvailability[timeSlotId];
    const isOccupied = scheduledEntries.some(entry => entry.timeSlotId === timeSlotId);
    return availability?.available && !isOccupied && !loadingSlots.has(timeSlotId);
  };

  const getSlotTooltip = (timeSlotId: number) => {
    const availability = slotAvailability[timeSlotId];
    const isOccupied = scheduledEntries.some(entry => entry.timeSlotId === timeSlotId);
    
    if (isOccupied) {
      return "Créneau déjà occupé par cette classe";
    }
    
    if (!availability) {
      return "Vérification en cours...";
    }
    
    if (availability.available) {
      return "Créneau disponible";
    }
    
    const conflicts = availability.conflicts;
    if (conflicts) {
      const messages = [];
      if (conflicts.conflicts.length > 0) {
        messages.push(...conflicts.conflicts);
      }
      if (conflicts.teacherUnavailable && conflicts.teacherAvailabilityReason) {
        messages.push(conflicts.teacherAvailabilityReason);
      }
      if (conflicts.classroomUnavailable && conflicts.classroomAvailabilityReason) {
        messages.push(conflicts.classroomAvailabilityReason);
      }
      return messages.join(', ');
    }
    
    return "Créneau non disponible";
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
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded animate-pulse"></div>
            <span>Vérification...</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(timeSlots).map(([day, slots]) => (
          <div key={day}>
            <h4 className="font-medium mb-2">
              {getDayDisplayName(day)}
            </h4>
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.idTimeSlot} className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className={getSlotButtonClass(slot.idTimeSlot)}
                    disabled={!isSlotClickable(slot.idTimeSlot)}
                    onClick={() => isSlotClickable(slot.idTimeSlot) && onSchedule(courseAssignment, slot.idTimeSlot)}
                    title={getSlotTooltip(slot.idTimeSlot)}
                  >
                    <div className="text-center">
                      <div>
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {loadingSlots.has(slot.idTimeSlot) && (
                        <div className="text-xs opacity-70 mt-1">
                          Vérification...
                        </div>
                      )}
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

export default EnhancedManualTimetablePlanner;
