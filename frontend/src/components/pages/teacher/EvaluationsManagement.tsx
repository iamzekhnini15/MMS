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
      <div className="flex justify-center items-center min-h-[400px] dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-300"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 m-6">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 dark:bg-neutral-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Évaluations
        </h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4 bg-neutral-700 dark:bg-neutral-600 hover:bg-neutral-800 dark:hover:bg-neutral-500 text-white"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Nouvelle Évaluation</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {currentPeriod && (
        <Card className="bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
              <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                Période actuelle: {currentPeriod.name}
              </span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300 text-xs sm:text-sm self-start sm:self-auto">
                {new Date(currentPeriod.startDate).toLocaleDateString()} -{' '}
                {new Date(currentPeriod.endDate).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-gray-800 dark:text-white text-base sm:text-lg">
              {editingEvaluation ? 'Modifier l\'évaluation' : 'Créer une nouvelle évaluation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleCreateEvaluation} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm dark:text-gray-300">Titre *</Label>
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
                    className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="evaluationDate" className="text-sm dark:text-gray-300">Date d'évaluation *</Label>
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
                    className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm dark:text-gray-300">Description</Label>
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
                  className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="classId" className="text-sm dark:text-gray-300">Classe *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        classId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                      <SelectValue placeholder="Choisir une classe" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-neutral-800 dark:border-neutral-700">
                      {classes?.map((cls: Classes) => (
                        <SelectItem
                          key={cls.idClass}
                          value={cls.idClass.toString()}
                          className="dark:text-white dark:focus:bg-neutral-700"
                        >
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subjectId" className="text-sm dark:text-gray-300">Matière *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEvaluation({
                        ...newEvaluation,
                        subjectId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                      <SelectValue placeholder="Choisir une matière" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-neutral-800 dark:border-neutral-700">
                      {subjects?.map((subject: Subject) => (
                        <SelectItem
                          key={subject.idSubject}
                          value={subject.idSubject!.toString()}
                          className="dark:text-white dark:focus:bg-neutral-700"
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxScore" className="text-sm dark:text-gray-300">Note maximale</Label>
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
                    className="text-sm h-9 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
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
                  className="rounded dark:bg-neutral-800 dark:border-neutral-700"
                />
                <Label htmlFor="visible" className="text-sm dark:text-gray-300">Visible aux étudiants</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-neutral-700 dark:bg-neutral-600 hover:bg-neutral-800 dark:hover:bg-neutral-500 text-white text-sm h-9"
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
                  className="text-sm h-9 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
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
            className="hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-neutral-800"
          >
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg truncate dark:text-white">
                      {evaluation.title}
                    </h3>
                    <Badge
                      variant={
                        evaluation.isVisible || false ? 'default' : 'secondary'
                      }
                      className={`text-xs self-start sm:self-auto ${
                        evaluation.isVisible || false 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                      }`}
                    >
                      {evaluation.isVisible || false ? 'Visible' : 'Masqué'}
                    </Badge>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{evaluation.description}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
                <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
                  {/* Bouton principal "Saisir les notes" à gauche */}
                  <Button
                    className="bg-neutral-700 dark:bg-neutral-600 hover:bg-neutral-800 dark:hover:bg-neutral-500 text-white text-sm h-9 flex-1 max-w-xs"
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
                      className={`text-xs h-8 px-3 ${
                        evaluation.isVisible 
                          ? "bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white border-green-600 dark:border-green-700" 
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800"
                      }`}
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
                      className="text-xs h-8 px-3 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
                    >
                      <EditIcon className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs h-8 px-3 dark:border-neutral-700 dark:hover:bg-neutral-800"
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
          <Card className="text-center py-8 sm:py-12 dark:bg-neutral-900 dark:border-neutral-800">
            <CardContent className="px-4 sm:px-6">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">Aucune évaluation trouvée</p>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                variant="outline"
                className="text-sm dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
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
