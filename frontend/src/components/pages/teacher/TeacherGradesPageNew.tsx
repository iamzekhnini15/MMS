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
  }, [fetchTeacherEvaluations, fetchClasses, fetchSubject, fetchActivePeriods]);

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">
            Chargement des évaluations...
          </div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Saisie des Notes
        </h1>
        <p className="text-gray-600">
          Sélectionnez une évaluation pour saisir ou modifier les notes des
          étudiants
        </p>
      </div>

      {!evaluations || evaluations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune évaluation trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé d'évaluations. Créez votre première
              évaluation pour pouvoir saisir des notes.
            </p>
            <Button onClick={() => navigate('/teacher/evaluations')}>
              Créer une évaluation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {evaluations.map((evaluation: Evaluation) => (
            <Card
              key={evaluation.idEvaluation}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {evaluation.title}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(evaluation.evaluationDate)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <strong>Classe:</strong>{' '}
                          {getClassname(evaluation.classId)}
                        </span>
                        <span>
                          <strong>Matière:</strong>{' '}
                          {getSubjectName(evaluation.subjectId)}
                        </span>
                        {evaluation.periodId && (
                          <span>
                            <strong>Période:</strong>{' '}
                            {getPeriodName(evaluation.periodId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={evaluation.isVisible ? 'default' : 'secondary'}
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
                    >
                      Notes{' '}
                      {evaluation.isGradesVisible ? 'visibles' : 'masquées'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {evaluation.description && (
                      <p className="mb-2">{evaluation.description}</p>
                    )}
                    <div className="flex gap-4">
                      <span>
                        <strong>Note max:</strong> {evaluation.maxScore} pts
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      evaluation.idEvaluation &&
                      handleGradeEvaluation(evaluation.idEvaluation)
                    }
                    className="flex items-center gap-2"
                    disabled={!evaluation.idEvaluation}
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Saisir les notes
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
