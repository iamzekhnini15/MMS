import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { ClassesContext } from '../../../contexts/ClassesContext';
import StatsContext from '../../../contexts/StatsContext';
import { UserContext } from '../../../contexts/UserContext';
import StudentsListModal from './StudentsListModal';
import type { Classes } from '../../../types';

const TeacherClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, loading, error, fetchClasses } = useContext(ClassesContext);
  const { 
    teacherStats, 
    fetchClassStats, 
    fetchTeacherStats,
    getStudentCountForClass 
  } = useContext(StatsContext);
  const { authenticatedUser } = useContext(UserContext);
  
  const [selectedClass, setSelectedClass] = useState<Classes | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (classes && classes.length > 0 && authenticatedUser) {
      // Fetch class stats
      const classIds = classes.map((classe: Classes) => classe.idClass);
      fetchClassStats(classIds);
      
      // Fetch teacher stats
      if (authenticatedUser.user.idUser) {
        fetchTeacherStats(authenticatedUser.user.idUser);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, authenticatedUser]);

  const handleViewClass = (classId: number) => {
    const classe = classes?.find((c: Classes) => c.idClass === classId);
    if (classe) {
      setSelectedClass(classe);
      setShowStudentsModal(true);
    }
  };

  const handleViewGrades = (classId: number) => {
    navigate(`/teacher/grades?classId=${classId}`);
  };

  const handleViewEvaluations = (classId: number) => {
    navigate(`/teacher/evaluations?classId=${classId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-300">Chargement des classes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-medium">Erreur de chargement</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mes Classes</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Vue d'ensemble de vos classes et étudiants
        </p>
      </div>

      {!classes || classes.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent className="px-4 sm:px-6">
            <UserGroupIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune classe trouvée
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Vous n'êtes assigné à aucune classe pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classe: Classes) => (
            <Card
              key={classe.idClass}
              className="hover:shadow-lg transition-shadow bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            >
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                      {classe.name}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Badge variant="outline" className="text-xs border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300">Niveau {classe.level}</Badge>
                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{classe.department}</Badge>
                      </div>
                    </div>
                  </div>
                  <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-3">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {getStudentCountForClass(classe.idClass)}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Étudiants</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">5</div>
                      <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">Matières</div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  {classe.responsibleTeacher && (
                    <div className="border-t border-gray-200 dark:border-neutral-700 pt-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Professeur responsable
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {classe.responsibleTeacher.user?.firstname}{' '}
                        {classe.responsibleTeacher.user?.lastname}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2 pt-3 border-t border-gray-200 dark:border-neutral-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewClass(classe.idClass)}
                      className="flex items-center justify-center gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      Voir les étudiants
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvaluations(classe.idClass)}
                        className="flex items-center justify-center gap-1 h-8 text-xs"
                      >
                        <AcademicCapIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">Évaluations</span>
                        <span className="sm:hidden">Eval.</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewGrades(classe.idClass)}
                        className="flex items-center justify-center gap-1 h-8 text-xs"
                      >
                        <ChartBarIcon className="h-3 w-3" />
                        Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats responsive */}
      {classes && classes.length > 0 && (
        <Card className="mt-6 sm:mt-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">Statistiques générales</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {teacherStats?.totalClasses || classes?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Classes totales</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {teacherStats?.totalStudents || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Étudiants totaux</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {teacherStats?.monthlyEvaluations || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="hidden sm:inline">Évaluations ce mois</span>
                  <span className="sm:hidden">Eval. ce mois</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {teacherStats?.averageGrade || 0}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Moyenne générale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal des étudiants */}
      {selectedClass && (
        <StudentsListModal
          classData={selectedClass}
          isOpen={showStudentsModal}
          onClose={() => {
            setShowStudentsModal(false);
            setSelectedClass(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherClassesPage;
