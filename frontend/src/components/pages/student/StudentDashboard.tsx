import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

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

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              Bulletins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Téléchargez vos bulletins scolaires
            </p>
            <Button className="mt-4 w-full" disabled>
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
