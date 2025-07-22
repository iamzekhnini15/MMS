import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import EvaluationContext from '../../../contexts/EvaluationContext';
import { SubjectContext } from '../../../contexts/SubjectContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import type { EvaluationGrade, Subject, BulletinPeriod } from '../../../types';

const MyGradesPage: React.FC = () => {
  const { evaluationGrades, loading, error, fetchVisibleGradesByStudent } =
    useContext(EvaluationContext);
  const { subjects, fetchAllSubjects } = useContext(SubjectContext);
  const { periods, fetchActivePeriods } = useContext(BulletinPeriodContext);

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [filteredGrades, setFilteredGrades] = useState<EvaluationGrade[]>([]);

  useEffect(() => {
    // Pour le moment, utilisons un ID étudiant hardcodé pour les tests
    const studentId = 1; // TODO: Récupérer de authenticatedUser quand disponible
    fetchVisibleGradesByStudent(studentId);
    fetchAllSubjects();
    fetchActivePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!evaluationGrades) {
      setFilteredGrades([]);
      return;
    }

    let filtered = [...evaluationGrades];

    // Filtrer par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter((grade: EvaluationGrade) => {
        // Utiliser les propriétés disponibles dans EvaluationGrade
        return grade.evaluationId === parseInt(selectedSubject); // Temporaire, sera corrigé avec les données API
      });
    }

    // Filtrer par période
    if (selectedPeriod !== 'all') {
      filtered = filtered.filter((grade: EvaluationGrade) => {
        // Utiliser les propriétés disponibles dans EvaluationGrade
        return grade.evaluationId === parseInt(selectedPeriod); // Temporaire, sera corrigé avec les données API
      });
    }

    // Trier par date de notation (plus récent en premier)
    filtered.sort((a: EvaluationGrade, b: EvaluationGrade) => {
      const dateA = new Date(a.gradedAt || '');
      const dateB = new Date(b.gradedAt || '');
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredGrades(filtered);
  }, [evaluationGrades, selectedSubject, selectedPeriod]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateSubjectAverage = (subjectId: number) => {
    const subjectGrades = filteredGrades.filter(
      (grade: EvaluationGrade) =>
        // Temporaire : utilisera les vraies données API plus tard
        grade.evaluationId === subjectId && grade.score !== null
    );

    if (subjectGrades.length === 0) return null;

    const totalScore = subjectGrades.reduce(
      (sum: number, grade: EvaluationGrade) => sum + (grade.score || 0),
      0
    );

    const totalMaxScore = subjectGrades.reduce(
      (sum: number, grade: EvaluationGrade) =>
        sum + (grade.maxScore || 20),
      0
    );

    return totalMaxScore > 0 ? (totalScore / totalMaxScore) * 20 : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Erreur</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const uniqueSubjects = subjects?.filter((subject: Subject) =>
    evaluationGrades?.some(
      (grade: EvaluationGrade) =>
        // Temporaire : sera corrigé avec les vraies données
        grade.evaluationId === subject.idSubject
    )
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Notes</h1>
          <p className="text-muted-foreground mt-2">
            Consultez vos résultats et suivez vos progrès
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">
            {filteredGrades.length} évaluation(s)
          </span>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <AcademicCapIcon className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {uniqueSubjects?.map((subject: Subject) => (
                    <SelectItem
                      key={subject.idSubject || 0}
                      value={(subject.idSubject || 0).toString()}
                    >
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  {periods?.map((period: BulletinPeriod) => (
                    <SelectItem
                      key={period.idPeriod || 0}
                      value={(period.idPeriod || 0).toString()}
                    >
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moyennes par matière */}
      {selectedSubject === 'all' && uniqueSubjects && uniqueSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Moyennes par matière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueSubjects.map((subject: Subject) => {
                const average = calculateSubjectAverage(subject.idSubject || 0);
                return (
                  <div
                    key={subject.idSubject || 0}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <h3 className="font-medium text-sm text-gray-600">
                      {subject.name}
                    </h3>
                    {average !== null ? (
                      <div className="mt-2">
                        <span
                          className={`text-2xl font-bold ${getGradeColor(
                            average,
                            20
                          )}`}
                        >
                          {average.toFixed(1)}/20
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((average / 20) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Aucune note disponible
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des notes */}
      {filteredGrades.length > 0 ? (
        <div className="grid gap-4">
          {filteredGrades.map((grade: EvaluationGrade) => (
            <Card key={grade.idGrade} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {grade.evaluationTitle || `Évaluation ${grade.evaluationId}`}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {/* Temporaire : sera remplacé par les vraies données */}
                            Matière
                          </span>
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(grade.gradedAt || new Date().toISOString())}
                          </span>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="text-right">
                        {grade.score !== null && grade.score !== undefined ? (
                          <div>
                            <Badge
                              className={`text-lg font-bold px-3 py-1 ${getGradeBadgeColor(
                                grade.score || 0,
                                grade.maxScore || 20
                              )}`}
                            >
                              {grade.score}/{grade.maxScore || 20}
                            </Badge>
                            <div
                              className={`text-sm font-medium mt-1 ${getGradeColor(
                                grade.score || 0,
                                grade.maxScore || 20
                              )}`}
                            >
                              {(
                                ((grade.score || 0) /
                                  (grade.maxScore || 20)) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Non noté
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Commentaire */}
                    {grade.comment && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Commentaire :
                        </p>
                        <p className="text-sm text-blue-700">{grade.comment}</p>
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>Statut: {grade.status || 'PRESENT'}</span>
                        <div className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          <span>Note visible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <AcademicCapIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucune note disponible
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedSubject !== 'all' || selectedPeriod !== 'all'
                ? 'Aucune note ne correspond aux filtres sélectionnés.'
                : 'Vos notes apparaîtront ici une fois que vos enseignants les auront saisies.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyGradesPage;
