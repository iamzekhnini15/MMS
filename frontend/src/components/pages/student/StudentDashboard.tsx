import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { UserContext } from '../../../contexts/UserContext';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext);
  const [hasBulletins, setHasBulletins] = useState(false);
  const [loadingBulletins, setLoadingBulletins] = useState(true);

  useEffect(() => {
    checkAvailableBulletins();
  }, [authenticatedUser]);

  const checkAvailableBulletins = async () => {
    if (!authenticatedUser?.user?.idUser) return;

    try {
      const response = await fetch(`/api/bulletins/student/user/${authenticatedUser.user.idUser}/visible`, {
        headers: {
          'Authorization': authenticatedUser.token,
        },
      });

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Étudiant</h1>
          <p className="text-muted-foreground mt-2">
            Accédez à vos notes et suivez vos progrès
          </p>
        </div>
        <AcademicCapIcon className="h-12 w-12 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => navigate('/student/grades')}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              Mes Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consultez vos notes et évaluations par matière
            </p>
            <Button className="mt-4 w-full">
              Voir mes notes
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder pour d'autres fonctionnalités futures */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              Emploi du temps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consultez votre emploi du temps
            </p>
            <Button className="mt-4 w-full" disabled>
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>

        {/* Afficher la card des bulletins seulement si aucun bulletin n'est disponible */}
        {!loadingBulletins && !hasBulletins && (
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                Bulletins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aucun bulletin disponible pour le moment
              </p>
              <Button className="mt-4 w-full" disabled>
                En attente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Afficher un message informatif si des bulletins sont disponibles */}
        {!loadingBulletins && hasBulletins && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Bulletins disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-4">
                Vos bulletins scolaires sont maintenant disponibles !
              </p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
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
