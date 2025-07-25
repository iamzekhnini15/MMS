import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { SubjectContext } from '../../../contexts/SubjectContext';
import type { Classes, Subject } from '../../../types';

interface SubjectCoefficient {
  idCoefficient?: number;
  subject: {
    idSubject: number;
    name: string;
    description: string;
    coefficient: number;
  };
  classEntity: {
    idClass: number;
    name: string;
  };
  coefficient: number;
  isActive: boolean;
}

interface SubjectWithCoefficient extends Subject {
  coefficient: number;
  isActive: boolean;
  hasCoefficientSet: boolean;
}

const TeacherCoefficientsPage: React.FC = () => {
  const {
    classes,
    loading: classesLoading,
    fetchClasses,
  } = useContext(ClassesContext);
  const {
    subjects,
    loading: subjectsLoading,
    fetchSubject,
  } = useContext(SubjectContext);

  const [coefficients, setCoefficients] = useState<SubjectCoefficient[]>([]);
  const [coefficientsLoading, setCoefficientsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCoefficient, setEditingCoefficient] = useState<number | null>(
    null,
  );
  const [editValue, setEditValue] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchSubject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sélectionner automatiquement la première classe quand les classes sont chargées
  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].idClass);
    }
  }, [classes, selectedClass]);

  // Charger les coefficients spécifiques quand une classe est sélectionnée
  useEffect(() => {
    if (selectedClass) {
      fetchCoefficientsByClass(selectedClass);
    }
  }, [selectedClass]);

  const fetchCoefficientsByClass = async (classId: number) => {
    console.log('Fetching coefficients for class:', classId);
    setCoefficientsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/coefficients/class/${classId}`);
      if (!response.ok) {
        // Si l'API retourne 404, ce n'est pas grave, on utilisera les coefficients de base
        if (response.status === 404) {
          console.log(
            'No specific coefficients found for class, using defaults',
          );
          setCoefficients([]);
          return;
        }
        throw new Error('Failed to fetch coefficients');
      }
      const data = await response.json();
      console.log('Fetched coefficients:', data);
      console.log('Setting coefficients:', data);
      setCoefficients(data);
    } catch (err) {
      console.warn(
        'Could not fetch specific coefficients, using default from subjects:',
        err,
      );
      setCoefficients([]);
    } finally {
      setCoefficientsLoading(false);
    }
  };

  const saveCoefficient = async (
    subjectId: number,
    classId: number,
    coefficient: number,
  ) => {
    console.log('saveCoefficient called with:', {
      subjectId,
      classId,
      coefficient,
    });
    try {
      const response = await fetch('/api/coefficients/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId,
          classId,
          coefficient,
          isActive: true,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to save coefficient');
      }

      const result = await response.json();
      console.log('Save result:', result);

      // Recharger les coefficients spécifiques pour cette classe
      if (selectedClass) {
        console.log('Reloading coefficients for class:', selectedClass);
        await fetchCoefficientsByClass(selectedClass);
      }
    } catch (err) {
      console.error('Error in saveCoefficient:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const handleEditStart = (coefficientId: number, currentValue: number) => {
    setEditingCoefficient(coefficientId);
    setEditValue(currentValue.toString());
  };

  const handleEditSave = async (subjectId: number, classId: number) => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue <= 0) {
      setError('Le coefficient doit être un nombre positif');
      return;
    }

    console.log('Saving coefficient:', { subjectId, classId, newValue });

    try {
      await saveCoefficient(subjectId, classId, newValue);
      setEditingCoefficient(null);
      setEditValue('');
      console.log('Coefficient saved successfully');
    } catch (err) {
      console.error('Error saving coefficient:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingCoefficient(null);
    setEditValue('');
  };

  const getClassName = (classId: number) => {
    const classe = classes?.find((c: Classes) => c.idClass === classId);
    return classe?.name || `Classe ${classId}`;
  };

  // Calculate subjects for the selected class with their coefficients
  const subjectsForClass = useMemo(() => {
    if (!subjects || !selectedClass) return [];

    return subjects.map((subject: Subject) => {
      // Chercher un coefficient spécifique pour cette classe
      const specificCoefficient = coefficients.find(
        (coeff) =>
          coeff.subject?.idSubject === subject.idSubject &&
          coeff.classEntity?.idClass === selectedClass,
      );

      return {
        ...subject,
        // Utiliser le coefficient spécifique s'il existe, sinon le coefficient par défaut du subject
        coefficient: specificCoefficient?.coefficient ?? subject.coefficient,
        isActive: specificCoefficient?.isActive ?? true,
        hasCoefficientSet: !!specificCoefficient, // true si coefficient personnalisé
      };
    });
  }, [subjects, selectedClass, coefficients]);

  if (classesLoading || subjectsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des Coefficients
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Configurez les coefficients pour chaque matière par classe
        </p>
      </div>

      {/* Class Selector responsive */}
      <Card className="mb-4 sm:mb-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900 dark:text-gray-100">
            <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-300" />
            Sélection de la classe
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {classes?.map((classe: Classes) => (
              <Button
                key={classe.idClass}
                variant={
                  selectedClass === classe.idClass ? 'default' : 'outline'
                }
                onClick={() => setSelectedClass(classe.idClass)}
                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              >
                {classe.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-red-800 dark:text-red-300 font-medium text-sm sm:text-base">
            Erreur
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {selectedClass && (
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
              Coefficients pour {getClassName(selectedClass)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {subjectsLoading || coefficientsLoading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Chargement des coefficients...
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectsForClass.map((subject: SubjectWithCoefficient) => (
                  <div
                    key={subject.idSubject}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-neutral-800 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subject.description}
                        </p>
                      </div>
                      {subject.hasCoefficientSet && (
                        <Badge
                          variant="default"
                          className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                        >
                          Configuré
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {editingCoefficient === subject.idSubject ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              selectedClass &&
                              subject.idSubject &&
                              handleEditSave(subject.idSubject, selectedClass)
                            }
                            disabled={!selectedClass || !subject.idSubject}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[3rem] text-right">
                            {subject.coefficient}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              subject.idSubject &&
                              handleEditStart(
                                subject.idSubject,
                                subject.coefficient,
                              )
                            }
                            disabled={!subject.idSubject}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClass && classes && classes.length === 0 && (
        <Card className="text-center py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <ChartBarIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucune classe trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aucune classe n'est disponible pour configurer les coefficients.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherCoefficientsPage;
