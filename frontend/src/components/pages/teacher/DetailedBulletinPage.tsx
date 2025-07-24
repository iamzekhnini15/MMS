import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useStudentBulletin, DetailedStudentBulletin } from '../../../contexts/StudentBulletinContext';
import jsPDF from 'jspdf';

const DetailedBulletinPage: React.FC = () => {
  const { studentId, periodId } = useParams<{studentId: string; periodId: string}>();
  const navigate = useNavigate();
  const { getDetailedBulletin } = useStudentBulletin();
  const [bulletinData, setBulletinData] = useState<DetailedStudentBulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    // Éviter les appels multiples
    if (hasAttempted) return;

    const fetchBulletinData = async () => {
      if (!studentId || !periodId) {
        setError('Paramètres manquants');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setHasAttempted(true);
        const data = await getDetailedBulletin(parseInt(studentId), parseInt(periodId));
        setBulletinData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement du bulletin:', err);
        setError('Erreur lors du chargement du bulletin');
      } finally {
        setLoading(false);
      }
    };

    fetchBulletinData();
  }, [studentId, periodId, getDetailedBulletin, hasAttempted]);

  const generatePDF = () => {
    if (!bulletinData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 40;

    // Style Apple-like simple
    doc.setFont('helvetica', 'normal');

    // Titre principal
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('Bulletin', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Sous-titre période
    doc.setFontSize(11);
    doc.setTextColor(136, 136, 136);
    doc.text(`${bulletinData.periodName} • ${bulletinData.academicYear}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;

    // Nom de l'élève
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(bulletinData.studentName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // Classe
    doc.setFontSize(11);
    doc.setTextColor(136, 136, 136);
    doc.text(bulletinData.className, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;

    // Moyenne générale (Hero section)
    doc.setFontSize(32);
    const overallAverage = bulletinData.generalAverage;
    if (overallAverage >= 50) {
      doc.setTextColor(34, 197, 94); // Vert
    } else {
      doc.setTextColor(220, 38, 38); // Rouge
    }
    doc.text(`${overallAverage.toFixed(1)}%`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(136, 136, 136);
    doc.text('Moyenne générale', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Statistiques discrètes
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Rang', margin, yPosition);
    doc.text('Moyenne classe', pageWidth - margin - 30, yPosition);
    yPosition += 8;

    doc.text(`${bulletinData.classRank}`, margin, yPosition);
    doc.text(`${bulletinData.classAverage.toFixed(1)}%`, pageWidth - margin - 30, yPosition);
    yPosition += 6;

    doc.setTextColor(136, 136, 136);
    doc.text(`sur ${bulletinData.totalStudents}`, margin, yPosition);
    yPosition += 20;

    // Séparateur
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Section Matières
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Matières', margin, yPosition);
    yPosition += 15;

    // Liste des matières
    doc.setFontSize(10);
    bulletinData.subjectGrades.forEach((subject) => {
      // Nom de la matière
      doc.setTextColor(0, 0, 0);
      doc.text(subject.subjectName, margin, yPosition);
      
      // Coefficient au centre
      doc.text(`×${subject.coefficient}`, pageWidth / 2 - 10, yPosition);
      
      // Moyenne à droite avec couleur
      if (subject.average >= 50) {
        doc.setTextColor(34, 197, 94); // Vert
      } else {
        doc.setTextColor(220, 38, 38); // Rouge
      }
      doc.text(`${subject.average.toFixed(1)}%`, pageWidth - margin - 20, yPosition);
      
      yPosition += 12;
    });

    yPosition += 5;

    // Total des points - Calculé à partir des matières
    const totalPoints = bulletinData.subjectGrades.reduce((sum, subject) => sum + (subject.average * subject.coefficient / 100), 0);
    const maxPoints = bulletinData.subjectGrades.reduce((sum, subject) => sum + subject.coefficient, 0);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Total des points', pageWidth - margin - 50, yPosition);
    yPosition += 8;
    doc.text(`${totalPoints.toFixed(1)} / ${maxPoints}`, pageWidth - margin - 50, yPosition);
    yPosition += 15;

    // Commentaire si présent
    if (bulletinData.generalComment && bulletinData.generalComment.trim()) {
      // Séparateur
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Commentaire', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      const commentLines = doc.splitTextToSize(bulletinData.generalComment, pageWidth - 2 * margin);
      doc.text(commentLines, margin, yPosition);
      yPosition += commentLines.length * 6;
    }

    // Pied de page
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(8);
    doc.setTextColor(136, 136, 136);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, footerY - 8, { align: 'center' });
    doc.text('Système de Gestion Scolaire', pageWidth / 2, footerY, { align: 'center' });

    // Télécharger le PDF
    const fileName = `bulletin_${bulletinData.studentName.replace(/\s+/g, '_')}_${bulletinData.periodName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const goBack = () => {
    navigate('/teacher/bulletins');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement du bulletin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour aux bulletins
          </Button>
        </div>
      </div>
    );
  }

  if (!bulletinData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Bulletin non trouvé</p>
          <Button onClick={goBack} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour aux bulletins
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header avec navigation responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <Button onClick={goBack} variant="outline" size="sm" className="text-sm h-9 self-start sm:self-auto dark:text-white">
          <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Retour aux bulletins
        </Button>
        <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 text-sm h-9 self-start sm:self-auto text-white dark:text-white">
          <DocumentArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          📥 Télécharger PDF
        </Button>
      </div>

      {/* Titre de la page responsive */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">Bulletin Détaillé</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          {bulletinData.studentName} • {bulletinData.className}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {bulletinData.periodName} - {bulletinData.academicYear}
        </p>
      </div>

      {/* Carte principale responsive */}
      <Card className="mb-4 sm:mb-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-3xl sm:text-4xl font-light mb-2">
            <span className={`${bulletinData.generalAverage >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {bulletinData.generalAverage.toFixed(1)}%
            </span>
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Moyenne générale</p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 sm:p-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">Rang dans la classe</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{bulletinData.classRank}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">sur {bulletinData.totalStudents}</p>
            </div>
            <div className="text-center p-3 sm:p-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne de classe</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">{bulletinData.classAverage.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matières responsive */}
      <Card className="mb-4 sm:mb-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">Détail par matière</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {bulletinData.subjectGrades.map((subject, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{subject.subjectName}</h3>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coefficient</p>
                    <Badge variant="outline" className="text-xs">×{subject.coefficient}</Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne</p>
                    <Badge className={`text-xs ${subject.average >= 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                      {subject.average.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">Total des points</span>
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {bulletinData.subjectGrades.reduce((sum, subject) => sum + (subject.average * subject.coefficient / 100), 0).toFixed(1)} / {bulletinData.subjectGrades.reduce((sum, subject) => sum + subject.coefficient, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commentaire responsive */}
      {bulletinData.generalComment && bulletinData.generalComment.trim() && (
        <Card className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">Commentaire</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="bg-blue-50 dark:bg-neutral-800 p-3 sm:p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{bulletinData.generalComment}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedBulletinPage;
