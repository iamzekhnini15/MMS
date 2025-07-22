import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import {
  CalendarIcon,
  PlusIcon,
  PencilSquareIcon as EditIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import EvaluationContext from '../../../contexts/EvaluationContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { SubjectContext } from '../../../contexts/SubjectContext';
import { Classes, Subject, Evaluation } from '../../../types';

interface EvaluationsManagementProps {
  teacherId: number;
}

const EvaluationsManagement: React.FC<EvaluationsManagementProps> = ({
  teacherId,
}) => {
  const {
    evaluations,
    loading,
    error,
    fetchTeacherEvaluations,
    createEvaluation,
    deleteEvaluation,
  } = useContext(EvaluationContext);
  const { currentPeriod, fetchActivePeriods, fetchCurrentPeriod } = useContext(
    BulletinPeriodContext,
  );
  const { classes, fetchAllClasses } = useContext(ClassesContext);
  const { subjects, fetchAllSubjects } = useContext(SubjectContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState<Partial<Evaluation>>({
    title: '',
    description: '',
    evaluationDate: '',
    maxScore: 20,
    isVisible: false,
    classId: undefined,
    subjectId: undefined,
    periodId: undefined,
  });

  useEffect(() => {
    fetchTeacherEvaluations(teacherId);
    fetchActivePeriods();
    fetchCurrentPeriod();
    fetchAllClasses();
    fetchAllSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEvaluation.title ||
      !newEvaluation.classId ||
      !newEvaluation.subjectId
    )
      return;

    try {
      await createEvaluation({
        ...newEvaluation,
        teacherId,
        periodId: newEvaluation.periodId || currentPeriod?.idPeriod,
      } as Evaluation);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create evaluation:', err);
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await deleteEvaluation(id);
      } catch (err) {
        console.error('Failed to delete evaluation:', err);
      }
    }
  };

  const resetForm = () => {
    setNewEvaluation({
      title: '',
      description: '',
      evaluationDate: '',
      maxScore: 20,
      isVisible: false,
      classId: undefined,
      subjectId: undefined,
      periodId: undefined,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des Évaluations
        </h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nouvelle Évaluation
        </Button>
      </div>

      {currentPeriod && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Période actuelle: {currentPeriod.name}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {new Date(currentPeriod.startDate).toLocaleDateString()} -{' '}
                {new Date(currentPeriod.endDate).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              Créer une nouvelle évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvaluation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={newEvaluation.title || ''}
                    onChange={(e) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ex: Contrôle chapitre 3"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="evaluationDate">Date d'évaluation *</Label>
                  <Input
                    id="evaluationDate"
                    type="date"
                    value={newEvaluation.evaluationDate || ''}
                    onChange={(e) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        evaluationDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newEvaluation.description || ''}
                  onChange={(e) =>
                    setNewEvaluation({
                      ...newEvaluation,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description optionnelle"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="classId">Classe *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        classId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls: Classes) => (
                        <SelectItem
                          key={cls.idClass}
                          value={cls.idClass.toString()}
                        >
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subjectId">Matière *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        subjectId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject: Subject) => (
                        <SelectItem
                          key={subject.idSubject}
                          value={subject.idSubject!.toString()}
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxScore">Note maximale</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    value={newEvaluation.maxScore || 20}
                    onChange={(e) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        maxScore: parseFloat(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={newEvaluation.isVisible || false}
                  onChange={(e) =>
                    setNewEvaluation({
                      ...newEvaluation,
                      isVisible: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="visible">Visible aux étudiants</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Créer l'évaluation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {evaluations?.map((evaluation: Evaluation) => (
          <Card
            key={evaluation.idEvaluation}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {evaluation.title}
                    </h3>
                    <Badge
                      variant={
                        evaluation.isVisible || false ? 'default' : 'secondary'
                      }
                    >
                      {evaluation.isVisible || false ? 'Visible' : 'Masqué'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{evaluation.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      📅{' '}
                      {new Date(evaluation.evaluationDate).toLocaleDateString()}
                    </span>
                    <span>📊 /{evaluation.maxScore}</span>
                    <span>
                      🏫{' '}
                      {
                        classes?.find(
                          (c: Classes) => c.idClass === evaluation.classId,
                        )?.name
                      }
                    </span>
                    <span>
                      📚{' '}
                      {
                        subjects?.find(
                          (s: Subject) => s.idSubject === evaluation.subjectId,
                        )?.name
                      }
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewEvaluation(evaluation)}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-800"
                    onClick={() =>
                      handleDeleteEvaluation(evaluation.idEvaluation!)
                    }
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      (window.location.href = `/teacher/grades/${evaluation.idEvaluation}`)
                    }
                  >
                    Saisir les notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!evaluations || evaluations.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">Aucune évaluation trouvée</p>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                Créer votre première évaluation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EvaluationsManagement;
