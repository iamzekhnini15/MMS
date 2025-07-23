import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { StudentContext } from '../../../contexts/StudentContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import type { Classes, Student, BulletinPeriod, StudentBulletin } from '../../../types';

// Interface étendue pour notre composant
interface EnhancedStudentBulletin extends StudentBulletin {
  student?: Student;
  class?: Classes;
  period?: BulletinPeriod;
}

interface BulletinViewModalProps {
  bulletin: EnhancedStudentBulletin | null;
  student: Student | null;
  classData: Classes | null;
  period: BulletinPeriod | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const BulletinViewModal: React.FC<BulletinViewModalProps> = ({
  bulletin,
  student,
  classData,
  period,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !bulletin || !student || !classData || !period) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bulletin de {student.user.firstname} {student.user.lastname}
            </h2>
            <p className="text-gray-600">
              {period.name} - {period.academicYear}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <XMarkIcon className="w-4 h-4" />
            Fermer
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Étudiant</span>
                </div>
                <p className="text-gray-900">
                  {student.user.firstname} {student.user.lastname}
                </p>
                <p className="text-sm text-gray-600">{student.user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Période</span>
                </div>
                <p className="text-gray-900">{period.name}</p>
                <p className="text-sm text-gray-600">
                  Du {new Date(period.startDate).toLocaleDateString()} au {new Date(period.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Classe</span>
                </div>
                <p className="text-gray-900">{classData.name}</p>
                <p className="text-sm text-gray-600">
                  Niveau {classData.level} - {classData.department}
                </p>
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Résultats</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {bulletin.generalAverage.toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600">Moyenne générale</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {bulletin.classRank}
                  </div>
                  <div className="text-sm text-green-600">
                    Rang ({bulletin.totalStudents} élèves)
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Moyenne de classe</span>
                  <span className="text-lg font-semibold">{bulletin.classAverage.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes par matière */}
              {bulletin.subjectGrades && bulletin.subjectGrades.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes par matière</h4>
                  <div className="space-y-2">
                    {bulletin.subjectGrades.map((subject, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{subject.subjectName}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Coef. {subject.coefficient}
                            </Badge>
                            <span className="font-semibold">
                              {subject.average.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commentaires généraux */}
          {bulletin.generalComment && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Commentaires généraux</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{bulletin.generalComment}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <PencilSquareIcon className="w-4 h-4" />
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
};

const BulletinsManagement: React.FC = () => {
  const { classes, loading: classesLoading, fetchClasses } = useContext(ClassesContext);
  const { students, getAllStudentsForClass } = useContext(StudentContext);
  const { periods, fetchActivePeriods } = useContext(BulletinPeriodContext);

  const [selectedClass, setSelectedClass] = useState<Classes | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<BulletinPeriod | null>(null);
  const [bulletins, setBulletins] = useState<StudentBulletin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<StudentBulletin | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<StudentBulletin | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchActivePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getAllStudentsForClass(selectedClass.idClass);
    }
  }, [selectedClass, getAllStudentsForClass]);

  const loadBulletins = async () => {
    if (!selectedClass || !selectedPeriod) return;

    setLoading(true);
    try {
      // Récupérer les bulletins existants
      const response = await fetch(
        `/api/bulletins/class/${selectedClass.idClass}/period/${selectedPeriod.idPeriod}`
      );
      
      if (response.ok) {
        const existingBulletins = await response.json();
        setBulletins(existingBulletins);
      } else {
        // Si pas de bulletins, afficher un message
        setBulletins([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des bulletins:', error);
      setBulletins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBulletin = (bulletin: StudentBulletin) => {
    // Trouver l'étudiant correspondant
    const student = students?.find(s => s.idStudent === bulletin.studentId);
    if (student) {
      setSelectedBulletin(bulletin);
      setSelectedStudent(student);
      setShowBulletinModal(true);
    }
  };

  const handleEditBulletin = () => {
    if (selectedBulletin) {
      setEditingBulletin(selectedBulletin);
      setShowBulletinModal(false);
    }
  };

  const handleSaveBulletin = async () => {
    if (!editingBulletin) return;

    try {
      const response = await fetch('/api/bulletins/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingBulletin),
      });

      if (response.ok) {
        // Rafraîchir la liste des bulletins
        loadBulletins();
        setEditingBulletin(null);
      } else {
        console.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du bulletin:', error);
    }
  };

  if (classesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Bulletins</h1>
        <p className="text-gray-600">
          Consultez et modifiez les bulletins de vos étudiants
        </p>
      </div>

      {/* Sélecteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Classe</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedClass?.idClass || ''}
                onChange={(e) => {
                  const classId = parseInt(e.target.value);
                  const classe = classes?.find((c: Classes) => c.idClass === classId);
                  setSelectedClass(classe || null);
                  setBulletins([]);
                }}
              >
                <option value="">Sélectionner une classe</option>
                {classes?.map((classe: Classes) => (
                  <option key={classe.idClass} value={classe.idClass}>
                    {classe.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Période</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedPeriod?.idPeriod || ''}
                onChange={(e) => {
                  const periodId = parseInt(e.target.value);
                  const period = periods?.find((p: BulletinPeriod) => p.idPeriod === periodId);
                  setSelectedPeriod(period || null);
                  setBulletins([]);
                }}
              >
                <option value="">Sélectionner une période</option>
                {periods?.map((period: BulletinPeriod) => (
                  <option key={period.idPeriod} value={period.idPeriod}>
                    {period.name} - {period.academicYear}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={loadBulletins}
                disabled={!selectedClass || !selectedPeriod || loading}
                className="w-full"
              >
                {loading ? 'Chargement...' : 'Charger les Bulletins'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des bulletins */}
      {bulletins.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulletins - {selectedClass?.name} - {selectedPeriod?.name}
          </h2>
          
          {bulletins.map((bulletin) => {
            const student = students?.find(s => s.idStudent === bulletin.studentId);
            return (
              <Card key={bulletin.idBulletin || bulletin.studentId} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {bulletin.studentName || (student ? `${student.user.firstname} ${student.user.lastname}` : 'Étudiant inconnu')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {student?.user.email || 'Email non disponible'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={bulletin.isVisible ? 'default' : 'secondary'}>
                            {bulletin.isVisible ? 'Publié' : 'Brouillon'}
                          </Badge>
                          <Badge variant="outline">
                            Moyenne: {bulletin.generalAverage.toFixed(2)}
                          </Badge>
                          <Badge variant="outline">
                            Rang: {bulletin.classRank}/{bulletin.totalStudents}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBulletin(bulletin)}
                        className="flex items-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const student = students?.find(s => s.idStudent === bulletin.studentId);
                          if (student) {
                            setSelectedStudent(student);
                            setEditingBulletin(bulletin);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedClass && selectedPeriod && bulletins.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bulletin trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Aucun bulletin n'a encore été généré pour cette classe et cette période.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de visualisation du bulletin */}
      <BulletinViewModal
        bulletin={selectedBulletin}
        student={selectedStudent}
        classData={selectedClass}
        period={selectedPeriod}
        isOpen={showBulletinModal}
        onClose={() => {
          setShowBulletinModal(false);
          setSelectedBulletin(null);
          setSelectedStudent(null);
        }}
        onEdit={handleEditBulletin}
      />

      {/* Modal d'édition */}
      {editingBulletin && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Modifier le bulletin de {selectedStudent.user.firstname} {selectedStudent.user.lastname}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setEditingBulletin(null)}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {editingBulletin.generalAverage.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600">Moyenne générale</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {editingBulletin.classRank}
                    </div>
                    <div className="text-sm text-green-600">
                      Rang ({editingBulletin.totalStudents} élèves)
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="generalComment">Commentaire général</Label>
                  <Textarea
                    id="generalComment"
                    value={editingBulletin.generalComment || ''}
                    onChange={(e) =>
                      setEditingBulletin({
                        ...editingBulletin,
                        generalComment: e.target.value,
                      })
                    }
                    placeholder="Commentaire sur le trimestre de l'étudiant..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={editingBulletin.isVisible || false}
                    onChange={(e) =>
                      setEditingBulletin({
                        ...editingBulletin,
                        isVisible: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isVisible">
                    Publier le bulletin (visible pour l'étudiant)
                  </Label>
                </div>
              </div>
            </div>
            <div className="border-t p-6 bg-gray-50 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingBulletin(null)}>
                Annuler
              </Button>
              <Button onClick={handleSaveBulletin}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulletinsManagement;
