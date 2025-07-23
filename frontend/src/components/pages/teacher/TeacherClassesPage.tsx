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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement des classes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Classes</h1>
        <p className="text-gray-600">
          Vue d'ensemble de vos classes et étudiants
        </p>
      </div>

      {!classes || classes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune classe trouvée
            </h3>
            <p className="text-gray-600">
              Vous n'êtes assigné à aucune classe pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classe: Classes) => (
            <Card
              key={classe.idClass}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {classe.name}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline">Niveau {classe.level}</Badge>
                        <Badge variant="secondary">{classe.department}</Badge>
                      </div>
                    </div>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {getStudentCountForClass(classe.idClass)}
                      </div>
                      <div className="text-sm text-blue-600">Étudiants</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">5</div>
                      <div className="text-sm text-green-600">Matières</div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  {classe.responsibleTeacher && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">
                        Professeur responsable
                      </h4>
                      <p className="text-sm text-gray-600">
                        {classe.responsibleTeacher.user?.firstname}{' '}
                        {classe.responsibleTeacher.user?.lastname}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleViewClass(classe.idClass)}
                      className="flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Voir les étudiants
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvaluations(classe.idClass)}
                        className="flex items-center justify-center gap-1"
                      >
                        <AcademicCapIcon className="h-4 w-4" />
                        Évaluations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewGrades(classe.idClass)}
                        className="flex items-center justify-center gap-1"
                      >
                        <ChartBarIcon className="h-4 w-4" />
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

      {/* Quick Stats */}
      {classes && classes.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Statistiques générales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {teacherStats?.totalClasses || classes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Classes totales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {teacherStats?.totalStudents || 0}
                </div>
                <div className="text-sm text-gray-600">Étudiants totaux</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {teacherStats?.monthlyEvaluations || 0}
                </div>
                <div className="text-sm text-gray-600">Évaluations ce mois</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {teacherStats?.averageGrade || 0}%
                </div>
                <div className="text-sm text-gray-600">Moyenne générale</div>
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
