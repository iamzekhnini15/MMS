import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpenIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Course {
  idCourse: number;
  name: string;
  teacher: {
    idTeacher: number;
    user: {
      firstname: string;
      lastname: string;
    };
  };
  classroom: {
    name: string;
  };
  level: string;
  startDateTime: string;
  endDateTime: string;
}

const StudentResources: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/students/me/courses');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des cours');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <Card className="text-center py-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Mes Ressources
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
            Cours disponibles pour votre niveau
          </p>
        </div>
        <div className="self-center sm:self-auto">
          <BookOpenIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary dark:text-blue-400" />
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <DocumentTextIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-muted-foreground dark:text-gray-300 mb-2">
              Aucun cours disponible
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
              Aucun cours n'a été assigné à votre niveau pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Card
              key={course.idCourse}
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {course.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                  <UserIcon className="h-4 w-4" />
                  <span>
                    {course.teacher.user.firstname}{' '}
                    {course.teacher.user.lastname}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                    <BookOpenIcon className="h-4 w-4" />
                    <span>Salle: {course.classroom.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Niveau: {course.level}</span>
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-gray-500 mt-3">
                    Du {formatDate(course.startDateTime)} au{' '}
                    {formatDate(course.endDateTime)}
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate(`/courses/${course.idCourse}`)}
                >
                  Accéder au cours
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResources;
