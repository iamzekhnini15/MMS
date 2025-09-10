import React, { useContext, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react';

import { TimetableContext } from '../../../contexts/TimetableContext';
import TimetableGenerator from './TimetableGenerator';
import ManualTimetablePlanner from './ManualTimetablePlanner';

const ManageTimetables: React.FC = () => {
  const {
    timetables,
    timeSlots,
    timetableEntries,
    teacherAvailabilities,
    classroomAvailabilities,
    loading,
    error,
    publishTimetable,
    deleteTimetable,
    initializeTimeSlots,
    fetchTimetableEntries,
    deleteTeacherAvailability,
    deleteClassroomAvailability,
  } = useContext(TimetableContext);

  const [activeTab, setActiveTab] = useState('overview');

  // Gestion des notifications
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // TODO: Implémenter un système de notification toast
  };

  const handlePublishTimetable = async (timetableId: number) => {
    try {
      await publishTimetable(timetableId);
      showNotification('Emploi du temps publié avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la publication', 'error');
    }
  };

  const handleDeleteTimetable = async (timetableId: number) => {
    if (
      window.confirm('Êtes-vous sûr de vouloir supprimer cet emploi du temps ?')
    ) {
      try {
        await deleteTimetable(timetableId);
        showNotification('Emploi du temps supprimé avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleInitializeTimeSlots = async () => {
    try {
      await initializeTimeSlots();
      showNotification('Créneaux horaires initialisés avec succès', 'success');
    } catch (error) {
      showNotification("Erreur lors de l'initialisation des créneaux", 'error');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Emplois du Temps</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="generate">Générer Auto</TabsTrigger>
          <TabsTrigger value="manual">Planifier Manuel</TabsTrigger>
          <TabsTrigger value="timeslots">Créneaux</TabsTrigger>
          <TabsTrigger value="availability">Disponibilités</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Emplois du temps
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timetables?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timetables?.filter((t) => t.isPublished).length || 0} publiés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Créneaux horaires
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeSlots?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Créneaux configurés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disponibilités
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(teacherAvailabilities?.length || 0) +
                    (classroomAvailabilities?.length || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Professeurs et salles configurées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des emplois du temps */}
          <Card>
            <CardHeader>
              <CardTitle>Emplois du temps existants</CardTitle>
              <CardDescription>
                Gérer les emplois du temps créés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Chargement...</p>
              ) : timetables && timetables.length > 0 ? (
                <div className="space-y-4">
                  {timetables.map((timetable) => (
                    <div
                      key={timetable.idTimetable}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{timetable.name}</h3>
                        <p className="text-sm text-gray-600">
                          Classe: {timetable.className} | Du{' '}
                          {new Date(timetable.startDate).toLocaleDateString()}{' '}
                          au {new Date(timetable.endDate).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <Badge
                            variant={
                              timetable.isPublished ? 'default' : 'secondary'
                            }
                          >
                            {timetable.isPublished ? 'Publié' : 'Brouillon'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchTimetableEntries(timetable.idTimetable)
                          }
                        >
                          Voir détails
                        </Button>
                        {!timetable.isPublished && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handlePublishTimetable(timetable.idTimetable)
                            }
                            disabled={loading}
                          >
                            Publier
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDeleteTimetable(timetable.idTimetable)
                          }
                          disabled={loading}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Aucun emploi du temps créé. Utilisez l'onglet "Générer" pour
                  en créer un.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Génération d'emploi du temps */}
        <TabsContent value="generate" className="space-y-4">
          <TimetableGenerator />
        </TabsContent>

        {/* Planification manuelle d'emploi du temps */}
        <TabsContent value="manual" className="space-y-4">
          <ManualTimetablePlanner />
        </TabsContent>

        {/* Gestion des créneaux horaires */}
        <TabsContent value="timeslots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créneaux horaires</CardTitle>
              <CardDescription>
                Configuration des créneaux horaires pour la génération d'emplois
                du temps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {timeSlots?.length || 0} créneaux configurés
                </p>
                <Button onClick={handleInitializeTimeSlots} disabled={loading}>
                  Initialiser les créneaux par défaut
                </Button>
              </div>

              {timeSlots && timeSlots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.idTimeSlot}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{slot.dayOfWeek}</p>
                          <p className="text-sm text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                        {slot.isBreak && <Badge variant="outline">Pause</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des disponibilités */}
        <TabsContent value="availability" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disponibilités des professeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilités des professeurs</CardTitle>
                <CardDescription>
                  Configurer les disponibilités des professeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teacherAvailabilities && teacherAvailabilities.length > 0 ? (
                  <div className="space-y-2">
                    {teacherAvailabilities.map((availability) => (
                      <div
                        key={availability.idAvailability}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {availability.teacherName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {availability.dayOfWeek}: {availability.startTime} -{' '}
                            {availability.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              availability.isAvailable
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {availability.isAvailable
                              ? 'Disponible'
                              : 'Indisponible'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              deleteTeacherAvailability(
                                availability.idAvailability,
                              )
                            }
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune disponibilité configurée
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Disponibilités des salles */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilités des salles</CardTitle>
                <CardDescription>
                  Configurer les disponibilités des salles de classe
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classroomAvailabilities &&
                classroomAvailabilities.length > 0 ? (
                  <div className="space-y-2">
                    {classroomAvailabilities.map((availability) => (
                      <div
                        key={availability.idAvailability}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">
                            {availability.classroomName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {availability.dayOfWeek}: {availability.startTime} -{' '}
                            {availability.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              availability.isAvailable
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {availability.isAvailable
                              ? 'Disponible'
                              : 'Indisponible'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              deleteClassroomAvailability(
                                availability.idAvailability,
                              )
                            }
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucune disponibilité configurée
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Détails d'un emploi du temps */}
      {timetableEntries && timetableEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'emploi du temps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetableEntries.map((entry) => (
                <div key={entry.idEntry} className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{entry.dayOfWeek}</Badge>
                      <span className="text-sm text-gray-600">
                        {entry.startTime} - {entry.endTime}
                      </span>
                    </div>
                    <h4 className="font-semibold">{entry.courseName}</h4>
                    <p className="text-sm text-gray-600">
                      Professeur: {entry.teacherName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Salle: {entry.classroomName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageTimetables;
