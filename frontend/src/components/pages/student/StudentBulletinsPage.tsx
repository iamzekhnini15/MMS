import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import { UserContext } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface StudentBulletinSummary {
  idBulletin: number;
  student: {
    idStudent: number;
    user: {
      idUser: number;
      firstname: string;
      lastname: string;
    };
  };
  bulletinPeriod: {
    idPeriod: number;
    name: string;
    academicYear: string;
    startDate: string;
    endDate: string;
  };
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  generalComment?: string;
  isVisible: boolean;
  generatedAt: string;
}

const StudentBulletinsPage: React.FC = () => {
  const { fetchActivePeriods } = useContext(BulletinPeriodContext);
  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [bulletins, setBulletins] = useState<StudentBulletinSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePeriods();
  }, [fetchActivePeriods]);

  useEffect(() => {
    if (authenticatedUser?.user) {
      loadStudentBulletins();
    }
  }, [authenticatedUser]);

  const loadStudentBulletins = async () => {
    if (!authenticatedUser?.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const userId = authenticatedUser.user.idUser;
      const response = await fetch(`/api/bulletins/student/user/${userId}/visible`, {
        method: 'GET',
        headers: {
          'Authorization': `${authenticatedUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des bulletins');
      }

      const bulletinsData: StudentBulletinSummary[] = await response.json();
      setBulletins(bulletinsData);
    } catch (err) {
      setError('Erreur lors du chargement des bulletins');
      console.error('Erreur loadStudentBulletins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailedBulletin = (bulletin: StudentBulletinSummary) => {
    navigate(`/student/bulletins/detail/${bulletin.student.idStudent}/${bulletin.bulletinPeriod.idPeriod}`);
  };

  const getGradeColor = (average: number) => {
    if (average >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (average >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement de vos bulletins...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Bulletins</h1>
        <p className="text-gray-600">
          Consultez vos bulletins scolaires rendus disponibles par vos professeurs
        </p>
      </div>

      {/* Liste des bulletins */}
      {bulletins.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bulletin disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Vos professeurs n'ont pas encore rendu de bulletins visibles pour vous.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bulletins.map((bulletin) => (
            <Card key={bulletin.idBulletin} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{bulletin.bulletinPeriod.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {bulletin.bulletinPeriod.academicYear}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Moyenne générale - mise en valeur */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-3xl font-bold mb-1 ${getGradeColor(bulletin.generalAverage).split(' ')[0]}`}>
                    {bulletin.generalAverage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Moyenne générale</div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>Rang</span>
                    </div>
                    <div className="font-semibold">
                      {bulletin.classRank}ème / {bulletin.totalStudents}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <AcademicCapIcon className="w-4 h-4" />
                      <span>Moy. Classe</span>
                    </div>
                    <div className="font-semibold">
                      {bulletin.classAverage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Date de génération */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Publié le {formatDate(bulletin.generatedAt)}</span>
                </div>

                {/* Commentaire s'il existe */}
                {bulletin.generalComment && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-1">Commentaire :</p>
                    <p className="text-sm text-blue-700">{bulletin.generalComment}</p>
                  </div>
                )}

                {/* Bouton d'action */}
                <div className="pt-2">
                  <Button 
                    onClick={() => handleViewDetailedBulletin(bulletin)}
                    className="w-full flex items-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Voir le détail
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBulletinsPage;
