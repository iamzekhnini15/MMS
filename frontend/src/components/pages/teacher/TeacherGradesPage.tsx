import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import EvaluationContext from '../../../contexts/EvaluationContext';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { SubjectContext } from '../../../contexts/SubjectContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import type {
  Classes,
  Subject,
  BulletinPeriod,
  Evaluation,
} from '../../../types';

const TeacherGradesPage: React.FC = () => {
  const navigate = useNavigate();
  const { evaluations, loading, error, fetchTeacherEvaluations } =
    useContext(EvaluationContext);
  const { classes, fetchClasses } = useContext(ClassesContext);
  const { subjects, fetchSubject } = useContext(SubjectContext);
  const { periods, fetchActivePeriods } = useContext(BulletinPeriodContext);

  // Simulated teacher ID - in real app, get from auth context
  const teacherId = 1;

  useEffect(() => {
    fetchTeacherEvaluations(teacherId);
    fetchClasses();
    fetchSubject();
    fetchActivePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeEvaluation = (evaluationId: number) => {
    navigate(`/teacher/grades/${evaluationId}`);
  };

  const getClassname = (classId: number) => {
    const classe = classes?.find((c: Classes) => c.idClass === classId);
    return classe?.name || `Classe ${classId}`;
  };

  const getSubjectName = (subjectId: number) => {
    const subject = subjects?.find((s: Subject) => s.idSubject === subjectId);
    return subject?.name || `Matière ${subjectId}`;
  };

  const getPeriodName = (periodId: number) => {
    const period = periods?.find(
      (p: BulletinPeriod) => p.idPeriod === periodId,
    );
    return period?.name || `Période ${periodId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 dark:bg-neutral-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Chargement des évaluations...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 dark:bg-neutral-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-400 font-medium">Erreur de chargement</h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 dark:bg-neutral-900 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Saisie des Notes
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Sélectionnez une évaluation pour saisir ou modifier les notes des
          étudiants
        </p>
      </div>

      {!evaluations || evaluations.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="px-4 sm:px-6">
            <AcademicCapIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune évaluation trouvée
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
              Vous n'avez pas encore créé d'évaluations. Créez votre première
              évaluation pour pouvoir saisir des notes.
            </p>
            <Button 
              onClick={() => navigate('/teacher/evaluations')}
              className="text-sm sm:text-base bg-neutral-700 dark:bg-neutral-600 hover:bg-neutral-800 dark:hover:bg-neutral-500 text-white"
            >
              Créer une évaluation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {evaluations.map((evaluation: Evaluation) => (
            <Card
              key={evaluation.idEvaluation}
              className="hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-neutral-800"
            >
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {evaluation.title}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        {formatDate(evaluation.evaluationDate)}
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div>
                          <strong>Classe:</strong> {getClassname(evaluation.classId)}
                        </div>
                        <div>
                          <strong>Matière:</strong> {getSubjectName(evaluation.subjectId)}
                        </div>
                        {evaluation.periodId && (
                          <div>
                            <strong>Période:</strong> {getPeriodName(evaluation.periodId)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <Badge
                      variant={evaluation.isVisible ? 'default' : 'secondary'}
                      className={`text-xs ${
                        evaluation.isVisible 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                      }`}
                    >
                      {evaluation.isVisible ? (
                        <>
                          <EyeIcon className="h-3 w-3 mr-1" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeSlashIcon className="h-3 w-3 mr-1" />
                          Masqué
                        </>
                      )}
                    </Badge>
                    <Badge
                      variant={
                        evaluation.isGradesVisible ? 'default' : 'outline'
                      }
                      className={`text-xs ${
                        evaluation.isGradesVisible 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-neutral-700'
                      }`}
                    >
                      Notes {evaluation.isGradesVisible ? 'visibles' : 'masquées'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {evaluation.description && (
                      <p className="mb-2 line-clamp-2">{evaluation.description}</p>
                    )}
                    <div>
                      <strong>Note max:</strong> {evaluation.maxScore} pts
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      evaluation.idEvaluation &&
                      handleGradeEvaluation(evaluation.idEvaluation)
                    }
                    className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 w-full sm:w-auto bg-neutral-700 dark:bg-neutral-600 hover:bg-neutral-800 dark:hover:bg-neutral-500 text-white"
                    disabled={!evaluation.idEvaluation}
                  >
                    <PencilSquareIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Saisir les notes</span>
                    <span className="sm:hidden">Saisir notes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherGradesPage;
