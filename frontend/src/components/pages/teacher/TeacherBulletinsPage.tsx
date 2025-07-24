import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  UserGroupIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { StudentContext } from '../../../contexts/StudentContext';
import { SubjectContext } from '../../../contexts/SubjectContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import BulletinCalculationContext from '../../../contexts/BulletinCalculationContext';
import { useStudentBulletin, StudentBulletin } from '../../../contexts/StudentBulletinContext';
import type { Classes, BulletinPeriod } from '../../../types';

const TeacherBulletinsPage: React.FC = () => {
  const navigate = useNavigate();
  const { classes, loading: classesLoading, fetchClasses } = useContext(ClassesContext);
  const { getAllStudentsForClass } = useContext(StudentContext);
  const { fetchAllSubjects } = useContext(SubjectContext);
  const { periods, currentPeriod, loading: periodsLoading, error: periodsError, fetchActivePeriods, fetchAllPeriods } = useContext(BulletinPeriodContext);
  const { classStatistics, loading: calculationLoading, fetchClassStatistics } = useContext(BulletinCalculationContext);
  const { 
    bulletins: realBulletins, 
    loading: bulletinLoading, 
    generateBulletinsForClass,
    getBulletinsByClassAndPeriod,
    updateBulletinComment,
    toggleBulletinVisibility,
    makeAllBulletinsVisible,
    hideAllBulletins
  } = useStudentBulletin();

  const [selectedClass, setSelectedClass] = useState<Classes | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<BulletinPeriod | null>(null);
  const [editingBulletin, setEditingBulletin] = useState<StudentBulletin | null>(null);
  const [bulletinsGenerated, setBulletinsGenerated] = useState(false);
  const [correctedAverages, setCorrectedAverages] = useState<{ [studentId: number]: number }>({});

  // Function to calculate corrected average from BulletinCalculationService
  const calculateCorrectedAverage = async (studentId: number) => {
    if (!selectedClass || !selectedPeriod) return null;
    
    try {
      const response = await fetch(`/api/bulletins/calculations/student/${studentId}/class/${selectedClass.idClass}/period/${selectedPeriod.idPeriod}`);
      if (response.ok) {
        const data = await response.json();
        return data.average;
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la moyenne:', error);
    }
    return null;
  };

  // Load corrected averages for all students
  const loadCorrectedAverages = async () => {
    if (!realBulletins || realBulletins.length === 0) return;

    const newCorrectedAverages: { [studentId: number]: number } = {};
    
    for (const bulletin of realBulletins) {
      const correctedAverage = await calculateCorrectedAverage(bulletin.student.idStudent);
      if (correctedAverage !== null) {
        newCorrectedAverages[bulletin.student.idStudent] = correctedAverage;
      }
    }
    
    setCorrectedAverages(newCorrectedAverages);
  };

  // Helper function to get the corrected average or fallback to stored average
  const getDisplayAverage = (bulletin: StudentBulletin) => {
    return correctedAverages[bulletin.student.idStudent] ?? bulletin.generalAverage;
  };

  useEffect(() => {
    fetchClasses();
    fetchActivePeriods();
    fetchAllPeriods();
    fetchAllSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPeriod) {
      setSelectedPeriod(currentPeriod);
    }
  }, [currentPeriod]);

  // Load bulletins when class and period are selected
  useEffect(() => {
    if (selectedClass && selectedPeriod) {
      loadBulletins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedPeriod]);

  // Load corrected averages when bulletins are loaded
  useEffect(() => {
    if (realBulletins && realBulletins.length > 0) {
      loadCorrectedAverages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realBulletins]);

  const loadBulletins = async () => {
    if (selectedClass?.idClass && selectedPeriod?.idPeriod) {
      try {
        await getBulletinsByClassAndPeriod(selectedClass.idClass, selectedPeriod.idPeriod);
        setBulletinsGenerated(true);
      } catch (error) {
        console.error('Erreur lors du chargement des bulletins:', error);
        setBulletinsGenerated(false);
      }
    }
  };

  const handleGenerateBulletins = async () => {
    if (selectedClass?.idClass && selectedPeriod?.idPeriod) {
      try {
        await generateBulletinsForClass(selectedClass.idClass, selectedPeriod.idPeriod);
        setBulletinsGenerated(true);
        // Refresh calculation statistics
        await fetchClassStatistics(selectedClass.idClass, selectedPeriod.idPeriod);
      } catch (error) {
        console.error('Erreur lors de la génération des bulletins:', error);
      }
    }
  };

  const handleClassChange = (classe: Classes) => {
    setSelectedClass(classe);
    setEditingBulletin(null);
    setBulletinsGenerated(false);
    if (classe.idClass) {
      getAllStudentsForClass(classe.idClass);
    }
  };

  const handleEditBulletin = (bulletin: StudentBulletin) => {
    setEditingBulletin({ ...bulletin });
  };

  const handleSaveBulletin = async () => {
    if (editingBulletin && editingBulletin.idBulletin) {
      try {
        await updateBulletinComment(editingBulletin.idBulletin, editingBulletin.generalComment || '');
        setEditingBulletin(null);
        // Reload bulletins to reflect changes
        await loadBulletins();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  const handleToggleValidation = async (bulletin: StudentBulletin) => {
    if (bulletin.idBulletin) {
      try {
        await toggleBulletinVisibility(bulletin.idBulletin);
        // Reload bulletins to reflect changes
        await loadBulletins();
      } catch (error) {
        console.error('Erreur lors du changement de visibilité:', error);
      }
    }
  };

  const handleMakeAllVisible = async () => {
    if (selectedClass?.idClass && selectedPeriod?.idPeriod) {
      try {
        await makeAllBulletinsVisible(selectedClass.idClass, selectedPeriod.idPeriod);
      } catch (error) {
        console.error('Erreur lors de la mise en visibilité:', error);
      }
    }
  };

  const handleHideAll = async () => {
    if (selectedClass?.idClass && selectedPeriod?.idPeriod) {
      try {
        await hideAllBulletins(selectedClass.idClass, selectedPeriod.idPeriod);
      } catch (error) {
        console.error('Erreur lors du masquage:', error);
      }
    }
  };

  const handleViewDetailedBulletin = (bulletin: StudentBulletin) => {
    if (selectedPeriod?.idPeriod) {
      // Rediriger vers la page de détail du bulletin
      navigate(`/teacher/bulletins/detail/${bulletin.student.idStudent}/${selectedPeriod.idPeriod}`);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-green-600 bg-green-50';
    if (grade >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  if (classesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Bulletins</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Consultez et modifiez les bulletins scolaires</p>
        </div>
      </div>

      {/* Sélecteurs responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Sélectionner une classe</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-2">
              {classes?.map((classe: Classes) => (
                <Button
                  key={classe.idClass}
                  variant={selectedClass?.idClass === classe.idClass ? "default" : "outline"}
                  className="w-full justify-start text-sm h-9"
                  onClick={() => handleClassChange(classe)}
                >
                  <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{classe.name} - Niveau {classe.level}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Période sélectionnée</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {periodsLoading && (
              <p className="text-sm text-blue-500">Chargement des périodes...</p>
            )}
            {periodsError && (
              <p className="text-sm text-red-500">Erreur: {periodsError}</p>
            )}
            {periods && periods.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">Périodes disponibles ({periods.length}):</p>
                {periods.map((period: any) => (
                  <div key={period.idPeriod} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <Badge 
                      className={`text-xs cursor-pointer self-start ${period.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period.name}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(period.startDate).toLocaleDateString()} - 
                      {new Date(period.endDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {currentPeriod && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium">Période courante:</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      {currentPeriod.name}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Aucune période trouvée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de la classe */}
      {selectedClass && selectedPeriod && (realBulletins.length > 0 || calculationLoading) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Statistiques - {selectedPeriod.name}
              {calculationLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculationLoading ? (
              <div className="text-center py-4">
                <p className="text-blue-600">Calcul des moyennes en cours...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Les données sont récupérées depuis la table evaluation_grades
                </p>
              </div>
            ) : classStatistics ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{classStatistics.totalStudents}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Étudiants avec notes</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {classStatistics.passCount}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Réussite (≥50)</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">
                      {Math.round(classStatistics.classAverage * 100) / 100}/100
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Moyenne classe</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">
                      {Math.round(classStatistics.passRate)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Taux de réussite</div>
                  </div>
                </div>
                
                {/* Statistiques supplémentaires */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm mb-3">
                    <div className="text-center">
                      <div className="font-medium text-gray-700 text-xs sm:text-sm">
                        {Math.round(classStatistics.classAverage * 100) / 100}/100
                      </div>
                      <div className="text-xs text-gray-500">Moyenne réelle calculée</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700 text-xs sm:text-sm">
                        {Math.round(classStatistics.maxGrade * 100) / 100}/100
                      </div>
                      <div className="text-xs text-gray-500">Meilleure note</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700 text-xs sm:text-sm">
                        {Math.round(classStatistics.minGrade * 100) / 100}/100
                      </div>
                      <div className="text-xs text-gray-500">Note la plus faible</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Moyennes calculées depuis les vraies évaluations (table evaluation_grades) pour "{selectedPeriod.name}"
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-yellow-600">Aucune évaluation trouvée pour cette période</p>
                <p className="text-sm text-gray-500 mt-1">
                  Vérifiez que des notes ont été saisies dans evaluation_grades pour cette classe et période
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Liste des bulletins */}
      {selectedClass && selectedPeriod && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                Bulletins - {selectedClass.name} - {selectedPeriod.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {!bulletinsGenerated && (
                <Button
                  onClick={handleGenerateBulletins}
                  className="bg-green-600 hover:bg-green-700 text-sm h-9"
                  disabled={bulletinLoading}
                >
                  <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="hidden sm:inline">Générer les bulletins</span>
                  <span className="sm:hidden">Générer</span>
                </Button>
              )}
              {bulletinsGenerated && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMakeAllVisible}
                    className="text-green-600 hover:text-green-700 text-sm h-9"
                    disabled={bulletinLoading}
                  >
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Rendre tous visibles</span>
                    <span className="sm:hidden">Visibles</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleHideAll}
                    className="text-red-600 hover:text-red-700 text-sm h-9"
                    disabled={bulletinLoading}
                  >
                    <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Masquer tous</span>
                    <span className="sm:hidden">Masquer</span>
                  </Button>
                </>
              )}
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                disabled={bulletinLoading}
                className="text-sm h-9"
              >
                <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Actualiser</span>
                <span className="sm:hidden">↻</span>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm h-9">
                <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Générer PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>

          {bulletinLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {realBulletins.length === 0 && !bulletinLoading && (
            <Card className="text-center py-6 sm:py-8">
              <CardContent className="px-4 sm:px-6">
                <DocumentTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-500 mb-4">Aucun bulletin trouvé pour cette classe</p>
                {selectedClass && selectedPeriod && (
                  <Button
                    onClick={handleGenerateBulletins}
                    className="bg-green-600 hover:bg-green-700 text-sm"
                  >
                    <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Générer les bulletins
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {realBulletins.map((bulletin) => (
            <Card key={bulletin.idBulletin} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {bulletin.student.user.firstname} {bulletin.student.user.lastname}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getGradeColor(getDisplayAverage(bulletin))}`}>
                          {Math.round(getDisplayAverage(bulletin) * 100) / 100}/100
                        </div>
                        <Badge variant={bulletin.isVisible ? "default" : "secondary"} className="text-xs">
                          {bulletin.isVisible ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Visible</span>
                              <span className="sm:hidden">✓</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Masqué</span>
                              <span className="sm:hidden">✗</span>
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
                      <div>
                        <span className="font-medium">ID:</span> {bulletin.student.idStudent}
                      </div>
                      <div>
                        <span className="font-medium">Rang:</span> {bulletin.classRank}/{bulletin.totalStudents}
                      </div>
                      <div>
                        <span className="font-medium">Moy. classe:</span> {Math.round(bulletin.classAverage * 100) / 100}/100
                      </div>
                      <div>
                        <span className="font-medium">Généré:</span> {new Date(bulletin.generatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {bulletin.generalComment && (
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-xs sm:text-sm mb-1">Commentaire général:</h4>
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 sm:line-clamp-none">{bulletin.generalComment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 self-start sm:self-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBulletin(bulletin)}
                      title="Modifier le bulletin"
                      className="text-xs h-8 px-2 sm:px-3"
                    >
                      <PencilSquareIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={bulletin.isVisible ? "default" : "outline"}
                      onClick={() => handleToggleValidation(bulletin)}
                      title={bulletin.isVisible ? "Masquer" : "Rendre visible"}
                      className="text-xs h-8 px-2 sm:px-3"
                    >
                      {bulletin.isVisible ? <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-2 sm:px-3"
                      title="Voir le bulletin complet"
                      onClick={() => handleViewDetailedBulletin(bulletin)}
                    >
                      <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal d'édition */}
      {editingBulletin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b gap-2 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                Modifier le bulletin - {editingBulletin.student.user.firstname} {editingBulletin.student.user.lastname}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBulletin(null)}
                className="self-end sm:self-auto"
              >
                Fermer
              </Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <Label htmlFor="generalComment" className="text-sm">Commentaire général</Label>
                <Textarea
                  id="generalComment"
                  value={editingBulletin.generalComment || ''}
                  onChange={(e) => setEditingBulletin({
                    ...editingBulletin,
                    generalComment: e.target.value
                  })}
                  placeholder="Saisir un commentaire général sur l'élève..."
                  className="mt-1 text-sm"
                  rows={4}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Statut:</Label>
                  <Badge variant={editingBulletin.isVisible ? "default" : "secondary"} className="text-xs">
                    {editingBulletin.isVisible ? "Visible" : "Masqué"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingBulletin(null)}
                    className="text-sm flex-1 sm:flex-none"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveBulletin}
                    className="bg-green-600 hover:bg-green-700 text-sm flex-1 sm:flex-none"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherBulletinsPage;
