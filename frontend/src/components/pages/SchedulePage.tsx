import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Search,
  BookOpen,
  User,
  Building,
  Edit,
  Trash2,
} from 'lucide-react';
import { CoursesContext } from '@/contexts/CoursesContext';
import { TeacherContext } from '@/contexts/TeacherContext';
import { ClassesContext } from '@/contexts/ClassesContext';
import { ClassroomContext } from '@/contexts/ClassroomContext';
import { CoursesContextType, Course } from '@/types';
import ScheduleLoadingSkeleton from '@/components/ui/schedule-loading';
import EmptySchedule from '@/components/ui/empty-schedule';
import CourseCard from '@/components/ui/course-card';

const SchedulePage = () => {
  const {
    courses,
    loading: coursesLoading,
    error,
    fetchCourses,
    createCourse,
    deleteCourses,
  } = useContext(CoursesContext) as CoursesContextType;
  const {
    teachers,
    loading: teachersLoading,
    fetchTeachers,
  } = useContext(TeacherContext);
  const { fetchClasses } = useContext(ClassesContext);
  const {
    classrooms,
    loading: classroomsLoading,
    fetchClassrooms,
  } = useContext(ClassroomContext);

  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>(
    'week',
  );
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    startDateTime: '',
    endDateTime: '',
    classroom: '',
    teacher: '',
    description: '',
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchClasses();
    fetchClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => ({
    hour: 8 + i,
    display: `${(8 + i).toString().padStart(2, '0')}:00`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const classroom = classrooms?.find(
        (c) => c.idClassroom.toString() === formData.classroom,
      );
      const teacher = teachers?.find(
        (t) => t.idTeacher.toString() === formData.teacher,
      );

      if (!classroom || !teacher) {
        console.error('Classroom or teacher not found');
        return;
      }

      const courseData = {
        name: formData.name,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        classroom: classroom,
        teacher: teacher,
        level: selectedCourse ? selectedCourse.level : '', // Or set a default value if needed
      };

      if (selectedCourse) {
        // Logique de mise à jour
        console.log('Updating course:', courseData);
      } else {
        await createCourse(courseData);
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDateTime: '',
      endDateTime: '',
      classroom: '',
      teacher: '',
      description: '',
    });
    setSelectedCourse(null);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      startDateTime: course.startDateTime,
      endDateTime: course.endDateTime,
      classroom: course.classroom.idClassroom.toString(),
      teacher: course.teacher.idTeacher.toString(),
      description: '',
    });
    setShowEditModal(true);
  };

  const handleDelete = async (courseId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await deleteCourses(courseId);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  const getDayOfWeek = (dateTime: string) => {
    const date = new Date(dateTime);
    const dayIndex = date.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
    return dayIndex === 0 ? 6 : dayIndex - 1; // Convertir en 0=lundi, ..., 6=dimanche
  };

  const getTimeSlot = (dateTime: string) => {
    const date = new Date(dateTime);
    const hour = date.getHours();
    return hour - 8; // Décalage par rapport à 8h
  };

  const isInCurrentWeek = (courseDateTime: string) => {
    const courseDate = new Date(courseDateTime);
    const currentWeekStart = new Date(currentDate);
    const day = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // Lundi de la semaine courante
    currentWeekStart.setDate(diff);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    return courseDate >= currentWeekStart && courseDate <= currentWeekEnd;
  };

  const filteredCourses =
    courses?.filter((course) => {
      // Filtre par semaine courante
      if (!isInCurrentWeek(course.startDateTime)) return false;

      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.user.firstname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        course.teacher.user.lastname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        course.classroom.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'teacher') return matchesSearch;
      if (selectedFilter === 'classroom') return matchesSearch;

      return matchesSearch;
    }) || [];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Vérifier si tous les contextes sont chargés
  const isLoading = coursesLoading || teachersLoading || classroomsLoading;

  // Debug: afficher les états de chargement
  console.log('SchedulePage:', {
    coursesCount: courses?.length || 0,
    filteredCoursesCount: filteredCourses.length,
  });

  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
      end: endOfWeek.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
  };

  if (isLoading) {
    return <ScheduleLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Emploi du temps</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Gestion complète des plannings et des créneaux
            </p>
          </div>
        </div>
        <EmptySchedule onCreateNew={() => setShowCreateModal(true)} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Emploi du temps</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestion complète des plannings et des créneaux
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau créneau
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Cours aujourd'hui
            </CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {courses?.filter(
                (c) =>
                  new Date(c.startDateTime).toDateString() ===
                  new Date().toDateString(),
              ).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Enseignants actifs
            </CardTitle>
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {teachers?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Salles utilisées
            </CardTitle>
            <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {classrooms?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total cours
            </CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {courses?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles et filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Tabs
                value={selectedView}
                onValueChange={(value: string) =>
                  setSelectedView(value as 'day' | 'week' | 'month')
                }
              >
                <TabsList>
                  <TabsTrigger value="day">Jour</TabsTrigger>
                  <TabsTrigger value="week">Semaine</TabsTrigger>
                  <TabsTrigger value="month">Mois</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="teacher">Par enseignant</SelectItem>
                  <SelectItem value="classroom">Par salle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation de semaine */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-lg font-medium">
          {getWeekRange().start} - {getWeekRange().end}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grille horaire */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Vue Desktop/Tablet - Grille complète */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[800px]">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="text-center font-medium p-2">Heures</div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium p-2 bg-muted rounded-lg"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille des créneaux */}
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <div key={slot.hour} className="grid grid-cols-6 gap-2">
                    <div className="flex items-center justify-center text-sm text-muted-foreground font-medium py-4">
                      {slot.display}
                    </div>
                    {days.map((_, dayIndex) => {
                      const coursesInSlot = filteredCourses.filter((course) => {
                        const courseDay = getDayOfWeek(course.startDateTime);
                        const courseSlot = getTimeSlot(course.startDateTime);
                        return (
                          courseDay === dayIndex && courseSlot === slot.hour - 8
                        );
                      });

                      return (
                        <div
                          key={dayIndex}
                          className="relative min-h-[80px] border rounded-lg p-2 bg-background hover:bg-muted/50 transition-colors"
                        >
                          {coursesInSlot.map((course) => (
                            <CourseCard
                              key={course.idCourse}
                              course={course}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vue Mobile - Liste par jour */}
          <div className="md:hidden space-y-4">
            {days.map((day, dayIndex) => {
              const daysCourses = filteredCourses.filter((course) => {
                const courseDay = getDayOfWeek(course.startDateTime);
                return courseDay === dayIndex;
              });

              return (
                <div key={day} className="border rounded-lg">
                  <div className="bg-muted p-3 rounded-t-lg">
                    <h3 className="font-medium text-center">{day}</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    {daysCourses.length > 0 ? (
                      daysCourses.map((course) => (
                        <div
                          key={course.idCourse}
                          className="bg-background border rounded-lg p-3"
                        >
                          <h4 className="font-medium text-sm">{course.name}</h4>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(course.startDateTime)} -{' '}
                              {formatTime(course.endDateTime)}
                            </div>
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {course.teacher.user.firstname}{' '}
                              {course.teacher.user.lastname}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {course.classroom.name}
                            </div>
                          </div>
                          <div className="flex justify-end gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(course)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(course.idCourse)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        Aucun cours
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des cours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Cours à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {filteredCourses.slice(0, 5).map((course) => (
              <div
                key={course.idCourse}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="w-2 h-12 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base">
                      {course.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 gap-1 sm:gap-0">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {formatTime(course.startDateTime)} -{' '}
                        {formatTime(course.endDateTime)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="truncate">
                          {course.teacher.user.firstname}{' '}
                          {course.teacher.user.lastname}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {course.classroom.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(course.startDateTime)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(course)}
                      className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(course.idCourse)}
                      className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <Dialog
        open={showCreateModal || showEditModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedCourse ? 'Modifier le créneau' : 'Nouveau créneau'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="name">Nom du cours</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Mathématiques"
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="teacher">Enseignant</Label>
                <Select
                  value={formData.teacher}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher: value })
                  }
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Sélectionner un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.idTeacher}
                        value={teacher.idTeacher.toString()}
                      >
                        {teacher.user.firstname} {teacher.user.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDateTime">Date et heure de début</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startDateTime: e.target.value })
                  }
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDateTime">Date et heure de fin</Label>
                <Input
                  id="endDateTime"
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endDateTime: e.target.value })
                  }
                  required
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classroom">Salle de classe</Label>
              <Select
                value={formData.classroom}
                onValueChange={(value) =>
                  setFormData({ ...formData, classroom: value })
                }
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms?.map((classroom) => (
                    <SelectItem
                      key={classroom.idClassroom}
                      value={classroom.idClassroom.toString()}
                    >
                      {classroom.name} (Capacité: {classroom.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description du cours ou informations supplémentaires..."
                rows={3}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="order-2 sm:order-1 text-sm sm:text-base"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="order-1 sm:order-2 text-sm sm:text-base"
              >
                {selectedCourse ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
