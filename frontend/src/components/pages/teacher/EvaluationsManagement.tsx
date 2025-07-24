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
    updateEvaluation,
    deleteEvaluation,
  } = useContext(EvaluationContext);
  const { currentPeriod, fetchActivePeriods, fetchCurrentPeriod } = useContext(
    BulletinPeriodContext,
  );
  const { classes, fetchAllClasses } = useContext(ClassesContext);
  const { subjects, fetchAllSubjects } = useContext(SubjectContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
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
      if (editingEvaluation) {
        // Mode édition
        await updateEvaluation(editingEvaluation.idEvaluation!, {
          ...newEvaluation,
          teacherId,
          periodId: newEvaluation.periodId || currentPeriod?.idPeriod,
        } as Evaluation);
      } else {
        // Mode création
        await createEvaluation({
          ...newEvaluation,
          teacherId,
          periodId: newEvaluation.periodId || currentPeriod?.idPeriod,
        } as Evaluation);
      }
      setShowCreateForm(false);
      setEditingEvaluation(null);
      resetForm();
    } catch (err) {
      console.error('Failed to save evaluation:', err);
    }
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setNewEvaluation({
      title: evaluation.title,
      description: evaluation.description,
      evaluationDate: evaluation.evaluationDate.split('T')[0], // Format for input date
      maxScore: evaluation.maxScore,
      isVisible: evaluation.isVisible,
      classId: evaluation.classId,
      subjectId: evaluation.subjectId,
      periodId: evaluation.periodId,
    });
    setShowCreateForm(true);
  };

  const handleToggleVisibility = async (evaluation: Evaluation) => {
    try {
      await updateEvaluation(evaluation.idEvaluation!, {
        ...evaluation,
        isVisible: !evaluation.isVisible,
      });
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
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
    setEditingEvaluation(null);
  };

  const handleCancelEdit = () => {
    setShowCreateForm(false);
    setEditingEvaluation(null);
    resetForm();
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Gestion des Évaluations
        </h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouvelle Évaluation</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {currentPeriod && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium text-blue-900 text-sm sm:text-base">
                Période actuelle: {currentPeriod.name}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm self-start sm:self-auto">
                {new Date(currentPeriod.startDate).toLocaleDateString()} -{' '}
                {new Date(currentPeriod.endDate).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-green-800 text-base sm:text-lg">
              {editingEvaluation ? 'Modifier l\'évaluation' : 'Créer une nouvelle évaluation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleCreateEvaluation} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm">Titre *</Label>
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
                    className="text-sm h-9"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="evaluationDate" className="text-sm">Date d'évaluation *</Label>
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
                    className="text-sm h-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">Description</Label>
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
                  className="text-sm h-9"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="classId" className="text-sm">Classe *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        classId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="text-sm h-9">
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
                  <Label htmlFor="subjectId" className="text-sm">Matière *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        subjectId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="text-sm h-9">
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
                  <Label htmlFor="maxScore" className="text-sm">Note maximale</Label>
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
                    className="text-sm h-9"
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
                <Label htmlFor="visible" className="text-sm">Visible aux étudiants</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-sm h-9"
                >
                  <span className="hidden sm:inline">
                    {editingEvaluation ? 'Modifier l\'évaluation' : 'Créer l\'évaluation'}
                  </span>
                  <span className="sm:hidden">
                    {editingEvaluation ? 'Modifier' : 'Créer'}
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="text-sm h-9"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:gap-4">
        {evaluations?.map((evaluation: Evaluation) => (
          <Card
            key={evaluation.idEvaluation}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {evaluation.title}
                    </h3>
                    <Badge
                      variant={
                        evaluation.isVisible || false ? 'default' : 'secondary'
                      }
                      className="text-xs self-start sm:self-auto"
                    >
                      {evaluation.isVisible || false ? 'Visible' : 'Masqué'}
                    </Badge>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{evaluation.description}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span className="hidden sm:inline">
                        {new Date(evaluation.evaluationDate).toLocaleDateString()}
                      </span>
                      <span className="sm:hidden">
                        {new Date(evaluation.evaluationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </span>
                    <span>📊 /{evaluation.maxScore}</span>
                    <span className="hidden sm:inline">
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
                
                {/* Nouvelle section des boutons - une seule ligne */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                  {/* Bouton principal "Saisir les notes" à gauche */}
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-sm h-9 flex-1 max-w-xs"
                    onClick={() =>
                      (window.location.href = `/teacher/grades/${evaluation.idEvaluation}`)
                    }
                  >
                    📝 Saisir les notes
                  </Button>
                  
                  {/* Groupe de petits boutons à droite */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={evaluation.isVisible ? "default" : "outline"}
                      className={`text-xs h-8 px-3 ${evaluation.isVisible ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => handleToggleVisibility(evaluation)}
                      title={evaluation.isVisible ? "Masquer aux étudiants" : "Rendre visible aux étudiants"}
                    >
                      {evaluation.isVisible ? '👁️' : '👁️‍🗨️'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvaluation(evaluation)}
                      title="Modifier l'évaluation"
                      className="text-xs h-8 px-3"
                    >
                      <EditIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-800 text-xs h-8 px-3"
                      onClick={() =>
                        handleDeleteEvaluation(evaluation.idEvaluation!)
                      }
                      title="Supprimer l'évaluation"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!evaluations || evaluations.length === 0) && (
          <Card className="text-center py-8 sm:py-12">
            <CardContent className="px-4 sm:px-6">
              <p className="text-sm sm:text-base text-gray-500 mb-4">Aucune évaluation trouvée</p>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                variant="outline"
                className="text-sm"
              >
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
