import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const Schedule = () => {
  const [selectedView, setSelectedView] = useState('week');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Emploi du temps</h1>
          <p className="text-muted-foreground">Gestion des plannings et des ressources</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <i className="fa-solid fa-plus mr-2"></i>
          Nouveau créneau
        </Button>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {['day', 'week', 'month'].map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? 'default' : 'outline'}
                  onClick={() => setSelectedView(view)}
                >
                  {view === 'day' ? 'Jour' : view === 'week' ? 'Semaine' : 'Mois'}
                </Button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="class">Par classe</SelectItem>
                  <SelectItem value="teacher">Par enseignant</SelectItem>
                  <SelectItem value="room">Par salle</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <i className="fa-solid fa-chevron-left"></i>
                </Button>
                <span className="text-sm font-medium">16 - 22 Mai 2025</span>
                <Button variant="ghost" size="icon">
                  <i className="fa-solid fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          </div>

          {/* Tableau horaire */}
          <div className="mx-auto w-[750px] h-[750px] overflow-auto bg-transparent">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-1"></div>
              {days.map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 10 }, (_, i) => (
                <React.Fragment key={i}>
                  <div className="py-3 text-right pr-4 text-sm text-muted-foreground">
                    {`${(8 + i).toString().padStart(2, '0')}:00`}
                  </div>
                  {Array.from({ length: 5 }, (_, j) => (
                    <div
                      key={j}
                      className="border rounded-xl p-2 min-h-[80px] hover:bg-muted transition-colors duration-150"
                    >
                      {i === 1 && j === 0 && (
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-lg text-sm">
                          <div className="font-medium">Mathématiques</div>
                          <div className="text-xs mt-1">6ème A - M. Dupont</div>
                          <div className="text-xs">Salle 102</div>
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal pour ajout de créneau */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer un créneau</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            {/* Ajoute les champs ici si besoin */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowScheduleModal(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
