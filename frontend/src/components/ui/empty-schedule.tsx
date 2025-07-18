import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyScheduleProps {
  onCreateNew: () => void;
}

const EmptySchedule = ({ onCreateNew }: EmptyScheduleProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun cours planifié</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          Commencez par créer votre premier créneau de cours pour organiser
          votre emploi du temps.
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un créneau
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptySchedule;
