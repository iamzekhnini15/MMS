import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../../../contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const [hasBulletins, setHasBulletins] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(true);

  useEffect(() => {
    checkAvailableBulletins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  const checkAvailableBulletins = async () => {
    if (!authenticatedUser?.user?.idUser) return;

    try {
      const response = await fetch(
        `/api/bulletins/student/user/${authenticatedUser.user.idUser}/visible`,
        {
          headers: {
            Authorization: authenticatedUser.token,
          },
        },
      );

      if (response.ok) {
        const bulletins = await response.json();
        setHasBulletins(bulletins.length > 0);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des bulletins:', error);
    } finally {
      setLoadingBulletins(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Tableau de Bord Étudiant
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
            Accédez à vos notes et suivez vos progrès
          </p>
        </div>
        <div className="flex-shrink-0 self-center sm:self-auto">
          <AcademicCapIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary dark:text-blue-400" />
        </div>
      </div>

      {/* Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card Mes Notes */}
        <Card
          className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
          onClick={() => navigate('/student/grades')}
        >
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center text-base sm:text-lg text-gray-900 dark:text-gray-100">
              <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Mes Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-3 sm:mb-4">
              Consultez vos notes et évaluations par matière
            </p>
            <Button className="w-full text-sm sm:text-base h-9 sm:h-10">
              Voir mes notes
            </Button>
          </CardContent>
        </Card>

        {/* Card Emploi du temps */}
        <Card className="opacity-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
              Emploi du temps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-3 sm:mb-4">
              Consultez votre emploi du temps
            </p>
            <Button
              className="w-full text-sm sm:text-base h-9 sm:h-10"
              disabled
            >
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>

        {/* Skeleton pour la card bulletin */}
        {loadingBulletins && (
          <div className="p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg flex flex-col gap-4 shadow animate-pulse">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-800" />
              <Skeleton className="h-6 w-32 rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded bg-gray-200 dark:bg-neutral-800" />
              <Skeleton className="h-8 w-20 rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
          </div>
        )}

        {/* Card Bulletins non disponibles */}
        {!loadingBulletins && !hasBulletins && (
          <Card className="opacity-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-gray-100">
                Bulletins
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mb-3 sm:mb-4">
                Aucun bulletin disponible pour le moment
              </p>
              <Button
                className="w-full text-sm sm:text-base h-9 sm:h-10"
                disabled
              >
                En attente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Bulletins disponibles */}
        {!loadingBulletins && hasBulletins && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center text-green-800 dark:text-green-400 text-base sm:text-lg">
                <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Bulletins disponibles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mb-3 sm:mb-4">
                Vos bulletins scolaires sont maintenant disponibles !
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm sm:text-base h-9 sm:h-10 text-white dark:text-white"
                onClick={() => navigate('/student/bulletins')}
              >
                Consulter mes bulletins
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
