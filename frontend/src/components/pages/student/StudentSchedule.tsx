import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const StudentSchedule: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon Emploi du Temps</h1>
          <p className="text-muted-foreground mt-2">
            Consultez votre planning de cours
          </p>
        </div>
        <CalendarIcon className="h-12 w-12 text-primary" />
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <ClockIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Emploi du temps bientôt disponible
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cette fonctionnalité sera implémentée dans une prochaine phase du projet.
          </p>
          <Button disabled>
            Voir l'emploi du temps
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSchedule;
