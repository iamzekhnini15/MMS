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
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBadgeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground dark:text-gray-300">Chargement de vos notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
        <Card className="p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <div className="text-center text-red-600 dark:text-red-400">
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* En-tête responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Mes Notes</h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
            Consultez vos résultats et suivez vos progrès
          </p>
        </div>
        <div className="flex items-center space-x-2 self-center sm:self-auto">
          <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-blue-400" />
          <span className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
            {filteredGrades.length} évaluation(s)
          </span>
        </div>
      </div>

      {/* Filtres responsive */}
      <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-initial">
              <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-48">
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

            <div className="flex items-center space-x-2 min-w-0 flex-1 sm:flex-initial">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground dark:text-gray-400 flex-shrink-0" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-48">
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
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
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
                    className="p-4 border rounded-lg bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                  >
                    <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">
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
                        <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary dark:bg-blue-400 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((average / 20) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
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

      {/* Affichage adaptatif des notes : Table sur desktop, Cards sur mobile */}
      {filteredGrades.length > 0 ? (
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
                  Mes Notes ({filteredGrades.length} évaluation{filteredGrades.length > 1 ? 's' : ''})
                </span>
              </div>
              {/* Boutons de tri responsive */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">Trier par:</span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="flex items-center text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  >
                    Date
                    {sortBy === 'date' && (
                      sortOrder === 'desc' ? <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" /> : <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === 'subject' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('subject')}
                    className="flex items-center text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  >
                    Matière
                    {sortBy === 'subject' && (
                      sortOrder === 'desc' ? <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" /> : <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === 'score' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSort('score')}
                    className="flex items-center text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  >
                    Note
                    {sortBy === 'score' && (
                      sortOrder === 'desc' ? <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" /> : <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Affichage mobile : Cartes style Smartschool */}
            <div className="block md:hidden p-4 space-y-3">
              {filteredGrades.map((grade: EvaluationGrade) => (
                <Card key={grade.idGrade} className="border border-gray-200 dark:border-neutral-700 hover:shadow-md transition-shadow bg-white dark:bg-neutral-800">
                  <CardContent className="p-4">
                    {/* Header de la carte avec matière et date */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                          {grade.evaluationTitle || `Évaluation ${grade.evaluationId}`}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {grade.subjectName || `Matière ${grade.evaluationId}`}
                        </Badge>
                      </div>
                      <div className="text-right ml-3">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(grade.gradedAt || new Date().toISOString())}
                        </div>
                        <Badge 
                          variant={grade.status === 'PRESENT' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {grade.status || 'PRESENT'}
                        </Badge>
                      </div>
                    </div>

                    {/* Score et pourcentage */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Note:</span>
                        {grade.score !== null && grade.score !== undefined ? (
                          <Badge
                            className={`font-bold ${getGradeBadgeColor(
                              grade.score,
                              grade.maxScore || 20
                            )}`}
                          >
                            {grade.score}/{grade.maxScore || 20}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                            Non noté
                          </Badge>
                        )}
                      </div>
                      
                      {grade.score !== null && grade.score !== undefined && (
                        <div className={`text-lg font-bold ${getGradeColor(grade.score, grade.maxScore || 20)}`}>
                          {grade.percentage ? grade.percentage.toFixed(1) : 
                           (() => {
                             const maxScore = grade.maxScore || 20;
                             const percentage = (grade.score / maxScore) * 100;
                             return percentage.toFixed(1);
                           })()}%
                        </div>
                      )}
                    </div>

                    {/* Commentaire si présent */}
                    {grade.comment && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-600">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">💬</span>
                          <p className="text-xs text-gray-600 dark:text-gray-300 flex-1">{grade.comment}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Affichage desktop : Table responsive avec scroll horizontal */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 min-w-[100px]" 
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> : <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 min-w-[150px]" 
                      onClick={() => handleSort('subject')}
                    >
                      <div className="flex items-center">
                        Évaluation
                        {sortBy === 'subject' && (
                          sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> : <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">Matière</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right min-w-[80px]" 
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center justify-end">
                        Note
                        {sortBy === 'score' && (
                          sortOrder === 'desc' ? <ArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /> : <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">Pourcentage</TableHead>
                    <TableHead className="min-w-[80px]">Statut</TableHead>
                    <TableHead className="min-w-[100px]">Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredGrades.map((grade: EvaluationGrade) => {
                  return (
                    <TableRow key={grade.idGrade} className="hover:bg-muted/50">
                      {/* Date */}
                      <TableCell className="min-w-[100px]">
                        <div className="flex items-center text-xs sm:text-sm">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(grade.gradedAt || new Date().toISOString())}
                          </span>
                        </div>
                      </TableCell>
                      
                      {/* Évaluation */}
                      <TableCell className="min-w-[150px]">
                        <div className="font-medium text-xs sm:text-sm truncate">
                          {grade.evaluationTitle || `Évaluation ${grade.evaluationId}`}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          Max: {grade.maxScore || 20} pts
                        </div>
                      </TableCell>
                      
                      {/* Matière */}
                      <TableCell className="min-w-[120px]">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs truncate max-w-full">
                          {grade.subjectName || `Matière ${grade.evaluationId}`}
                        </Badge>
                      </TableCell>
                      
                      {/* Note */}
                      <TableCell className="text-right min-w-[80px]">
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
                            {grade.percentage ? grade.percentage.toFixed(1) : 
                             (() => {
                               const maxScore = grade.maxScore || 20;
                               const percentage = (grade.score / maxScore) * 100;
                               return percentage.toFixed(1);
                             })()}%
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      
                      {/* Statut */}
                      <TableCell className="min-w-[80px]">
                        <Badge 
                          variant={grade.status === 'PRESENT' ? 'default' : 'destructive'}
                          className="text-[10px] sm:text-xs"
                        >
                          {grade.status || 'PRESENT'}
                        </Badge>
                      </TableCell>
                      
                      {/* Commentaire */}
                      <TableCell className="min-w-[100px]">
                        {grade.comment ? (
                          <div className="max-w-xs">
                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 truncate" title={grade.comment}>
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
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <AcademicCapIcon className="h-16 w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground dark:text-gray-300 mb-2">
              Aucune note disponible
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
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
