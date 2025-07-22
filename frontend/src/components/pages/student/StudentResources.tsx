import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const StudentResources: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Ressources</h1>
          <p className="text-muted-foreground mt-2">
            Accédez à vos cours et documents pédagogiques
          </p>
        </div>
        <BookOpenIcon className="h-12 w-12 text-primary" />
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <DocumentTextIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Ressources bientôt disponibles
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vos enseignants pourront partager des documents, cours et exercices ici.
          </p>
          <Button disabled>
            Parcourir les ressources
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResources;
