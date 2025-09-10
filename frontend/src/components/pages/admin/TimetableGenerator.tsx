import React, { useContext, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, GraduationCap, Clock, User } from 'lucide-react';

import { ClassesContext } from '../../../contexts/ClassesContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { TimetableContext } from '../../../contexts/TimetableContext';
import { Teacher, Course } from '@/types';

interface CourseAssignment {
  courseId: number;
  courseName: string;
  hours: number;
  teacherId: number | null;
  teacherName: string;
}

interface GenerationFormData {
  classId: number | null;
  className: string;
  startDate: string;
  endDate: string;
  courseAssignments: CourseAssignment[];
}

const TimetableGenerator: React.FC = () => {
  const { classes } = useContext(ClassesContext);
  const { courses } = useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { generateAdvancedTimetable, loading } = useContext(TimetableContext);

  const [formData, setFormData] = useState<GenerationFormData>({
    classId: null,
    className: '',
    startDate: '',
    endDate: '',
    courseAssignments: [],
  });

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [eligibleTeachers, setEligibleTeachers] = useState<{
    [courseId: number]: Teacher[];
  }>({});

  // Mettre à jour les cours disponibles quand une classe est sélectionnée
  useEffect(() => {
    if (formData.classId && courses) {
      const selectedClass = classes?.find(
        (c) => c.idClass === formData.classId,
      );
      if (selectedClass) {
        // Filtrer les cours par niveau
        const compatibleCourses = courses.filter(
          (course) => course.level === selectedClass.level.toString(),
        );
        setAvailableCourses(compatibleCourses);

        // Réinitialiser les assignations
        setFormData((prev) => ({
          ...prev,
          courseAssignments: [],
        }));
      }
    }
  }, [formData.classId, courses, classes]);

  // Mettre à jour les professeurs éligibles pour chaque cours
  useEffect(() => {
    if (formData.courseAssignments.length > 0 && teachers) {
      const newEligibleTeachers: { [courseId: number]: Teacher[] } = {};

      formData.courseAssignments.forEach((assignment) => {
        const course = courses?.find((c) => c.idCourse === assignment.courseId);
        if (course && teachers) {
          // Filtrer les professeurs par spécialité (supposons que course.name correspond aux spécialités)
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
            hours: 2, // Valeur par défaut
            teacherId: null,
            teacherName: '',
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
    }));
  };

  const updateCourseHours = (courseId: number, hours: number) => {
    setFormData((prev) => ({
      ...prev,
      courseAssignments: prev.courseAssignments.map((assignment) =>
        assignment.courseId === courseId
          ? { ...assignment, hours: Math.max(1, hours) }
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
              teacherId: teacher ? teacher.idTeacher : null,
              teacherName: teacher
                ? `${teacher.user.firstname} ${teacher.user.lastname}`
                : '',
            }
          : assignment,
      ),
    }));
  };

  const handleGenerate = async () => {
    if (
      !formData.classId ||
      !formData.startDate ||
      !formData.endDate ||
      formData.courseAssignments.length === 0
    ) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que tous les cours ont un professeur assigné
    const unassignedCourses = formData.courseAssignments.filter(
      (a) => !a.teacherId,
    );
    if (unassignedCourses.length > 0) {
      alert('Veuillez assigner un professeur à tous les cours');
      return;
    }

    try {
      // Préparer les données pour l'API
      const generationRequest = {
        name: `Emploi du temps ${formData.className} - ${new Date().toLocaleDateString()}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        classRequirements: [
          {
            classId: formData.classId,
            courses: formData.courseAssignments.map((assignment) => ({
              courseId: assignment.courseId,
              hoursPerWeek: assignment.hours,
              preferredTeacherIds: assignment.teacherId
                ? [assignment.teacherId]
                : [],
              preferredClassroomIds: [],
            })),
          },
        ],
        options: {
          maxTimeoutSeconds: 30,
          allowPartialSolution: true,
          priority: 'BALANCED',
        },
      };

      await generateAdvancedTimetable(generationRequest);
      alert('Emploi du temps généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert("Erreur lors de la génération de l'emploi du temps");
    }
  };

  const isFormValid = () => {
    return (
      formData.classId &&
      formData.startDate &&
      formData.endDate &&
      formData.courseAssignments.length > 0 &&
      formData.courseAssignments.every((a) => a.teacherId)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Générateur d'Emploi du Temps
          </CardTitle>
          <CardDescription>
            Créez un emploi du temps personnalisé en sélectionnant une classe,
            les cours et les professeurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection de la classe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Classe *</Label>
              <Select onValueChange={handleClassSelection}>
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
              <Input
                id="startDate"
                type="date"
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
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Informations de la classe sélectionnée */}
          {formData.classId && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Classe sélectionnée : {formData.className}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {availableCourses.length} cours compatibles disponibles (niveau{' '}
                {classes?.find((c) => c.idClass === formData.classId)?.level})
              </p>
            </div>
          )}

          {/* Sélection des cours */}
          {formData.classId && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">
                  Cours à inclure *
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

              {/* Liste des cours assignés */}
              <div className="space-y-4">
                {formData.courseAssignments.map((assignment) => (
                  <Card key={assignment.courseId} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Badge variant="outline">{assignment.courseName}</Badge>
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          removeCourseAssignment(assignment.courseId)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombre d'heures */}
                      <div>
                        <Label className="text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Heures par semaine
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCourseHours(
                                assignment.courseId,
                                assignment.hours - 1,
                              )
                            }
                            disabled={assignment.hours <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {assignment.hours}h
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCourseHours(
                                assignment.courseId,
                                assignment.hours + 1,
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Sélection du professeur */}
                      <div>
                        <Label className="text-sm flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Professeur
                        </Label>
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
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({teacher.specialities})
                                  </span>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {formData.courseAssignments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun cours sélectionné. Utilisez le menu déroulant ci-dessus
                  pour ajouter des cours.
                </div>
              )}
            </div>
          )}

          {/* Résumé */}
          {formData.courseAssignments.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Résumé
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p>• {formData.courseAssignments.length} cours sélectionnés</p>
                <p>
                  •{' '}
                  {formData.courseAssignments.reduce(
                    (sum, a) => sum + a.hours,
                    0,
                  )}{' '}
                  heures totales par semaine
                </p>
                <p>
                  •{' '}
                  {formData.courseAssignments.filter((a) => a.teacherId).length}
                  /{formData.courseAssignments.length} professeurs assignés
                </p>
              </div>
            </div>
          )}

          {/* Bouton de génération */}
          <Button
            onClick={handleGenerate}
            disabled={!isFormValid() || loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Génération en cours...' : "Générer l'Emploi du Temps"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableGenerator;
