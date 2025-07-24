import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useStudentBulletin, DetailedStudentBulletin } from '../../../contexts/StudentBulletinContext';
import jsPDF from 'jspdf';

interface DetailedBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  periodId: number;
  studentName: string;
}

const DetailedBulletinModal: React.FC<DetailedBulletinModalProps> = ({
  isOpen,
  onClose,
  studentId,
  periodId
}) => {
  const { getDetailedBulletin, loading } = useStudentBulletin();
  const [bulletinData, setBulletinData] = useState<DetailedStudentBulletin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (isOpen && studentId && periodId) {
      loadDetailedBulletin();
    }
  }, [isOpen, studentId, periodId]);

  const loadDetailedBulletin = async () => {
    try {
      setError(null);
      const data = await getDetailedBulletin(studentId, periodId);
      setBulletinData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du bulletin détaillé');
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (grade >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'graded':
        return <Badge variant="default" className="bg-green-100 text-green-800">Notée</Badge>;
      case 'absent':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Absent</Badge>;
      case 'excused':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Excusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const generatePDF = async () => {
    if (!bulletinData) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      let currentY = 40;

      // === DESIGN MINIMALISTE APPLE-STYLE ===
      
      // Titre principal - Simple et élégant
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'light');
      pdf.text('Bulletin', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;
      
      // Sous-titre discret
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${bulletinData.periodName} • ${bulletinData.academicYear}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 30;

      // === SECTION ÉLÈVE - Minimaliste ===
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'light');
      pdf.text(bulletinData.studentName, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      pdf.setFontSize(12);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`${bulletinData.className}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 25;

      // === MOYENNE GÉNÉRALE - Focus principal ===
      const generalAvg = bulletinData.generalAverage;
      const avgColor = generalAvg >= 50 ? [34, 197, 94] : [239, 68, 68]; // Vert ou Rouge
      
      pdf.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
      pdf.setFontSize(48);
      pdf.setFont('helvetica', 'light');
      pdf.text(`${generalAvg.toFixed(1)}%`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 12;
      
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Moyenne générale', pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      // === STATISTIQUES DISCRÈTES ===
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const statsY = currentY;
      // Rang
      pdf.text('Rang', 40, statsY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${bulletinData.classRank}`, 40, statsY + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`sur ${bulletinData.totalStudents}`, 40, statsY + 10);
      
      // Moyenne classe
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text('Moyenne classe', pageWidth - 40, statsY, { align: 'right' });
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${bulletinData.classAverage.toFixed(1)}%`, pageWidth - 40, statsY + 5, { align: 'right' });
      
      currentY += 35;

      // === LIGNE DE SÉPARATION SUBTILE ===
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.line(40, currentY, pageWidth - 40, currentY);
      currentY += 20;

      // === MATIÈRES - Design épuré ===
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'light');
      pdf.text('Matières', 40, currentY);
      currentY += 15;

      // Tableau minimaliste
      bulletinData.subjectGrades.forEach((subject, index) => {
        const subjectAvg = subject.average;
        const subjectColor = subjectAvg >= 50 ? [34, 197, 94] : [239, 68, 68];
        
        // Nom de la matière
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subject.subjectName, 40, currentY);
        
        // Coefficient discret
        pdf.setTextColor(160, 160, 160);
        pdf.setFontSize(9);
        pdf.text(`×${subject.coefficient}`, 110, currentY);
        
        // Moyenne avec couleur
        pdf.setTextColor(subjectColor[0], subjectColor[1], subjectColor[2]);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'medium');
        pdf.text(`${subjectAvg.toFixed(1)}%`, pageWidth - 40, currentY, { align: 'right' });
        
        currentY += 12;
        
        // Ligne subtile entre matières (sauf dernière)
        if (index < bulletinData.subjectGrades.length - 1) {
          pdf.setDrawColor(240, 240, 240);
          pdf.setLineWidth(0.3);
          pdf.line(40, currentY - 3, pageWidth - 40, currentY - 3);
        }
      });

      currentY += 15;

      // === TOTAL DES POINTS - Discret ===
      const totalPoints = bulletinData.subjectGrades.reduce((sum, subject) => sum + subject.weightedAverage, 0);
      const totalCoefficients = bulletinData.subjectGrades.reduce((sum, subject) => sum + subject.coefficient, 0);
      
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Total des points', pageWidth - 40, currentY, { align: 'right' });
      currentY += 4;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`${totalPoints.toFixed(1)} / ${(totalCoefficients * 100).toFixed(0)}`, pageWidth - 40, currentY, { align: 'right' });
      currentY += 25;

      // === COMMENTAIRE - Si présent ===
      if (bulletinData.generalComment) {
        // Ligne de séparation
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.line(40, currentY, pageWidth - 40, currentY);
        currentY += 15;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'light');
        pdf.text('Commentaire', 40, currentY);
        currentY += 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        
        const commentLines = pdf.splitTextToSize(bulletinData.generalComment, pageWidth - 80);
        pdf.text(commentLines, 40, currentY);
        currentY += commentLines.length * 4 + 15;
      }

      // === PIED DE PAGE MINIMALISTE ===
      const footerY = pageHeight - 30;
      
      pdf.setTextColor(180, 180, 180);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      const currentDate = new Date().toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      pdf.text(`Généré le ${currentDate}`, pageWidth / 2, footerY, { align: 'center' });
      pdf.text('Système de Gestion Scolaire', pageWidth / 2, footerY + 5, { align: 'center' });

      // Télécharger le PDF
      const fileName = `Bulletin_${bulletinData.studentName.replace(/\s+/g, '_')}_${bulletinData.periodName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Erreur</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!bulletinData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulletin non trouvé</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">Aucun bulletin trouvé pour cet étudiant et cette période.</p>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6" />
                Bulletin Détaillé
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                Consultation complète des notes par matière
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête du bulletin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Élève</p>
                  <p className="text-lg font-semibold">{bulletinData.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Classe</p>
                  <p className="text-lg font-semibold">{bulletinData.className}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Période</p>
                  <p className="text-lg font-semibold">{bulletinData.periodName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Année Académique</p>
                  <p className="text-lg font-semibold">{bulletinData.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Moyenne Générale</p>
                  <Badge className={`text-lg px-3 py-1 ${getGradeColor(bulletinData.generalAverage)}`}>
                    {bulletinData.generalAverage.toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rang</p>
                  <p className="text-lg font-semibold">
                    {bulletinData.classRank}ème / {bulletinData.totalStudents}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Moyenne de Classe</p>
                  <p className="text-lg font-semibold">{bulletinData.classAverage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Généré le</p>
                  <p className="text-lg font-semibold">{formatDate(bulletinData.generatedAt)}</p>
                </div>
              </div>
              {bulletinData.generalComment && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Commentaire Général :</p>
                  <p className="text-blue-700">{bulletinData.generalComment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes par matière */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6" />
              Notes par Matière
            </h3>
            
            {bulletinData.subjectGrades.map((subject, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                    <div className="text-right">
                      <Badge className={`text-lg px-3 py-1 mb-2 ${getGradeColor(subject.average)}`}>
                        {subject.average.toFixed(1)}%
                      </Badge>
                      <div className="text-sm text-gray-600">
                        <p>Coefficient: {subject.coefficient}</p>
                        <p>Points: {subject.weightedAverage.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {subject.evaluationGrades.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4" />
                        Évaluations ({subject.evaluationGrades.length})
                      </h4>
                      <div className="grid gap-3">
                        {subject.evaluationGrades.map((evaluation) => (
                          <div 
                            key={evaluation.idGrade} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{evaluation.evaluationTitle}</span>
                                {getStatusBadge(evaluation.status)}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  {formatDate(evaluation.gradedAt)}
                                </span>
                                <span>Par: {evaluation.gradedByName}</span>
                              </div>
                              {evaluation.comment && (
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  "{evaluation.comment}"
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className={`text-lg font-semibold px-3 py-1 rounded-lg border ${getGradeColor(evaluation.percentage)}`}>
                                {evaluation.score.toFixed(1)} / {evaluation.maxScore}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {evaluation.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune évaluation pour cette matière</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedBulletinModal;
