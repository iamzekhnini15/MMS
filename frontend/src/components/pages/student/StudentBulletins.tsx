import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrophyIcon, DocumentIcon } from '@heroicons/react/24/outline';

const StudentBulletins: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Bulletins</h1>
          <p className="text-muted-foreground mt-2">
            Téléchargez et consultez vos bulletins scolaires
          </p>
        </div>
        <TrophyIcon className="h-12 w-12 text-primary" />
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <DocumentIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Bulletins bientôt disponibles
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vos bulletins seront générés automatiquement à la fin de chaque période d'évaluation.
          </p>
          <Button disabled>
            Télécharger les bulletins
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentBulletins;
