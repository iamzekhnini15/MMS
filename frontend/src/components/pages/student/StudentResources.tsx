import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const StudentResources: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Mes Ressources
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
            Accédez à vos cours et documents pédagogiques
          </p>
        </div>
        <div className="self-center sm:self-auto">
          <BookOpenIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary dark:text-blue-400" />
        </div>
      </div>

      {/* Card responsive */}
      <Card className="text-center py-8 sm:py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
        <CardContent>
          <DocumentTextIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-muted-foreground dark:text-gray-300 mb-2">
            Ressources bientôt disponibles
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 max-w-md mx-auto">
            Vos enseignants pourront partager des documents, cours et exercices
            ici.
          </p>
          <Button
            disabled
            className="text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-6"
          >
            Parcourir les ressources
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResources;
