import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ArrowUpIcon,
  ArrowDownIcon,
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
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

    // Trier selon les critères sélectionnés
    filtered.sort((a: EvaluationGrade, b: EvaluationGrade) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.gradedAt || '');
          const dateB = new Date(b.gradedAt || '');
          comparison = dateB.getTime() - dateA.getTime(); // Par défaut le plus récent en premier
          break;
        case 'subject':
          const subjectA = a.evaluationTitle || '';
          const subjectB = b.evaluationTitle || '';
          comparison = subjectA.localeCompare(subjectB);
          break;
        case 'score':
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          const maxScoreA = a.maxScore || 20;
          const maxScoreB = b.maxScore || 20;
          const percentageA = (scoreA / maxScoreA) * 100;
          const percentageB = (scoreB / maxScoreB) * 100;
          comparison = percentageB - percentageA; // Par défaut les meilleures notes en premier
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    setFilteredGrades(filtered);
  }, [evaluationGrades, selectedSubject, selectedPeriod, sortBy, sortOrder]);

  const handleSort = (column: 'date' | 'subject' | 'score') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

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

      {/* Table des notes */}
      {filteredGrades.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Mes Notes ({filteredGrades.length} évaluation{filteredGrades.length > 1 ? 's' : ''})
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Trier par:</span>
                <Button
                  variant={sortBy === 'date' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="flex items-center"
                >
                  Date
                  {sortBy === 'date' && (
                    sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 ml-1" /> : <ArrowUpIcon className="w-3 h-3 ml-1" />
                  )}
                </Button>
                <Button
                  variant={sortBy === 'subject' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('subject')}
                  className="flex items-center"
                >
                  Matière
                  {sortBy === 'subject' && (
                    sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 ml-1" /> : <ArrowUpIcon className="w-3 h-3 ml-1" />
                  )}
                </Button>
                <Button
                  variant={sortBy === 'score' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('score')}
                  className="flex items-center"
                >
                  Note
                  {sortBy === 'score' && (
                    sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 ml-1" /> : <ArrowUpIcon className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        sortOrder === 'desc' ? <ArrowDownIcon className="w-4 h-4 ml-1" /> : <ArrowUpIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('subject')}
                  >
                    <div className="flex items-center">
                      Évaluation
                      {sortBy === 'subject' && (
                        sortOrder === 'desc' ? <ArrowDownIcon className="w-4 h-4 ml-1" /> : <ArrowUpIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-right" 
                    onClick={() => handleSort('score')}
                  >
                    <div className="flex items-center justify-end">
                      Note
                      {sortBy === 'score' && (
                        sortOrder === 'desc' ? <ArrowDownIcon className="w-4 h-4 ml-1" /> : <ArrowUpIcon className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Pourcentage</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade: EvaluationGrade) => {
                  const percentage = grade.score && grade.maxScore 
                    ? ((grade.score / grade.maxScore) * 100) 
                    : 0;
                  
                  return (
                    <TableRow key={grade.idGrade} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(grade.gradedAt || new Date().toISOString())}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {grade.evaluationTitle || `Évaluation ${grade.evaluationId}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Max: {grade.maxScore || 20} points
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {/* Temporaire : sera remplacé par les vraies données */}
                          Matière
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {grade.score !== null && grade.score !== undefined ? (
                          <div className="flex items-center justify-end">
                            <Badge
                              className={`font-bold ${getGradeBadgeColor(
                                grade.score,
                                grade.maxScore || 20
                              )}`}
                            >
                              {grade.score}/{grade.maxScore || 20}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Non noté
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {grade.score !== null && grade.score !== undefined ? (
                          <div className={`font-semibold ${getGradeColor(grade.score, grade.maxScore || 20)}`}>
                            {percentage.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={grade.status === 'PRESENT' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {grade.status || 'PRESENT'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {grade.comment ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate" title={grade.comment}>
                              {grade.comment}
                            </p>
                            {grade.comment.length > 50 && (
                              <Button variant="ghost" size="sm" className="text-xs h-auto p-0 mt-1">
                                <EyeIcon className="w-3 h-3 mr-1" />
                                Voir plus
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
