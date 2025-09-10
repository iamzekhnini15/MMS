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
import { Skeleton } from '@/components/ui/skeleton';

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

const StudentBulletins: React.FC = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const loadStudentBulletins = async () => {
    if (!authenticatedUser?.user) return;

    setLoading(true);
    setError(null);

    try {
      const userId = authenticatedUser.user.idUser;
      const response = await fetch(
        `/api/bulletins/student/user/${userId}/visible`,
        {
          method: 'GET',
          headers: {
            Authorization: `${authenticatedUser.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

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
    navigate(
      `/student/bulletins/detail/${bulletin.student.idStudent}/${bulletin.bulletinPeriod.idPeriod}`,
    );
  };

  const getGradeColor = (average: number) => {
    if (average >= 80)
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
    if (average >= 50)
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        {/* Header skeleton */}
        <div className="mb-4 sm:mb-6">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Cards skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col gap-4 shadow animate-pulse"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded" />
              </div>
              <div className="text-center p-3 sm:p-4">
                <Skeleton className="h-8 w-24 mx-auto rounded" />
                <Skeleton className="h-4 w-20 mx-auto mt-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Skeleton className="h-6 w-16 mx-auto rounded" />
                <Skeleton className="h-6 w-16 mx-auto rounded" />
              </div>
              <Skeleton className="h-4 w-32 mt-2 rounded" />
              <Skeleton className="h-8 w-full mt-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
        <Card className="border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* En-tête responsive */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Mes Bulletins
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Consultez vos bulletins scolaires rendus disponibles par vos
          professeurs
        </p>
      </div>

      {/* Liste des bulletins responsive */}
      {bulletins.length === 0 ? (
        <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardContent>
            <DocumentTextIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucun bulletin disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
              Vos professeurs n'ont pas encore rendu de bulletins visibles pour
              vous.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {bulletins.map((bulletin) => (
            <Card
              key={bulletin.idBulletin}
              className="hover:shadow-lg transition-all duration-200 transform bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <CardTitle className="text-base sm:text-lg truncate text-gray-900 dark:text-gray-100">
                      {bulletin.bulletinPeriod.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs self-start sm:self-center"
                  >
                    {bulletin.bulletinPeriod.academicYear}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4">
                {/* Moyenne générale - mise en valeur responsive */}
                <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <div
                    className={`text-2xl sm:text-3xl font-bold mb-1 bg-gray-50 dark:bg-neutral-800 ${getGradeColor(bulletin.generalAverage).split(' ')[0]} `}
                  >
                    {bulletin.generalAverage.toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Moyenne générale
                  </div>
                </div>

                {/* Statistiques responsive */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                      <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Rang</span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      {bulletin.classRank}ème / {bulletin.totalStudents}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                      <AcademicCapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">Moy. Classe</span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                      {bulletin.classAverage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Date de génération responsive */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    Publié le {formatDate(bulletin.generatedAt)}
                  </span>
                </div>

                {/* Commentaire s'il existe - responsive */}
                {bulletin.generalComment && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                      Commentaire :
                    </p>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                      {bulletin.generalComment}
                    </p>
                  </div>
                )}

                {/* Bouton d'action responsive */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleViewDetailedBulletin(bulletin)}
                    className="w-full flex items-center justify-center gap-2 text-sm sm:text-base h-9 sm:h-10 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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

export default StudentBulletins;
