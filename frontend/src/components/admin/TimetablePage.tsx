import React, { useState, useEffect, useContext } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  Settings,
  Save,
  Trash2,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import AvailabilityManagement from './AvailabilityManagement';

// Import des contextes
import { ClassesContext } from '@/contexts/ClassesContext';
import { SubjectContext } from '@/contexts/SubjectContext';
import { TeacherContext } from '@/contexts/TeacherContext';
import { ClassroomContext } from '@/contexts/ClassroomContext';
import { useToast } from '../ui/use-toast';

interface TimeSlot {
  idTimeSlot: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  name: string;
  description?: string;
}

interface Timetable {
  idTimetable: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  className: string;
}

interface TimetableEntry {
  idTimetableEntry: number;
  subjectName: string;
  teacherName: string;
  classroomName: string;
  timeSlot: TimeSlot;
}

interface GenerationRequest {
  classId: number;
  startDate: string;
  endDate: string;
  subjectHours: { [key: number]: number };
}

const TimetablePage: React.FC = () => {
  // Contextes
  const { classes, fetchClasses } = useContext(ClassesContext);
  const { subjects, fetchAllSubjects } = useContext(SubjectContext);
  const { fetchTeachers } = useContext(TeacherContext);
  const { fetchClassrooms } = useContext(ClassroomContext);

  // État local
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(
    null,
  );
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  // Temporary notification system
  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
  ) => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // TODO: Replace with proper toast notification
  };

  const { toast } = useToast(); // TODO: Fix toast import

  // Génération d'emploi du temps
  const [generationForm, setGenerationForm] = useState<GenerationRequest>({
    classId: 0,
    startDate: '',
    endDate: '',
    subjectHours: {},
  });

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    // Charger toutes les données nécessaires
    const loadAllData = async () => {
      try {
        await Promise.all([
          loadTimetables(),
          loadTimeSlots(),
          fetchClasses(),
          fetchAllSubjects(),
          fetchTeachers(),
          fetchClassrooms(),
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTimetables = async () => {
    try {
      const response = await fetch(`${API_BASE}/timetables`);
      const data = await response.json();
      setTimetables(data);
    } catch (error) {
      showNotification('Impossible de charger les emplois du temps', 'error');
    }
  };

  const loadTimeSlots = async () => {
    try {
      const response = await fetch(`${API_BASE}/timetables/time-slots`);
      const data = await response.json();
      setTimeSlots(data);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
    }
  };

  const initializeTimeSlots = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/timetables/time-slots/init`, {
        method: 'POST',
      });
      await loadTimeSlots();
      showNotification('Créneaux horaires initialisés avec succès', 'success');
    } catch (error) {
      showNotification("Erreur lors de l'initialisation des créneaux", 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async () => {
    if (
      !generationForm.classId ||
      !generationForm.startDate ||
      !generationForm.endDate
    ) {
      showNotification(
        'Veuillez remplir tous les champs obligatoires',
        'error',
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/timetables/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationForm),
      });

      if (response.ok) {
        await loadTimetables();
        showNotification('Emploi du temps généré avec succès', 'success');
      } else {
        throw new Error('Erreur lors de la génération');
      }
    } catch (error) {
      showNotification(
        "Erreur lors de la génération de l'emploi du temps",
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTimetableEntries = async (timetableId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/timetables/${timetableId}/entries`,
      );
      const data = await response.json();
      setTimetableEntries(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de charger les détails de l'emploi du temps",
        variant: 'destructive',
      });
    }
  };

  const publishTimetable = async (timetableId: number) => {
    try {
      await fetch(`${API_BASE}/timetables/${timetableId}/publish`, {
        method: 'PUT',
      });
      await loadTimetables();
      toast({
        title: 'Succès',
        description: 'Emploi du temps publié avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la publication',
        variant: 'destructive',
      });
    }
  };

  const deleteTimetable = async (timetableId: number) => {
    try {
      await fetch(`${API_BASE}/timetables/${timetableId}`, {
        method: 'DELETE',
      });
      await loadTimetables();
      toast({
        title: 'Succès',
        description: 'Emploi du temps supprimé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', variant: 'secondary' as const },
      PUBLISHED: { label: 'Publié', variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const groupTimeSlotsByDay = (timeSlots: TimeSlot[]) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const dayNames = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
    };

    return days.map((day) => ({
      day,
      dayName: dayNames[day as keyof typeof dayNames],
      slots: timeSlots.filter((slot) => slot.dayOfWeek === day),
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Emplois du Temps</h1>
          <p className="text-muted-foreground">
            Administration des emplois du temps scolaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={initializeTimeSlots}
            disabled={loading}
          >
            <Settings className="mr-2 h-4 w-4" />
            Initialiser Créneaux
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="timeslots">Créneaux</TabsTrigger>
          <TabsTrigger value="availability">Disponibilités</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Emplois du Temps Existants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timetables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun emploi du temps trouvé</p>
                  <p className="text-sm">
                    Créez votre premier emploi du temps dans l'onglet "Générer"
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {timetables.map((timetable) => (
                    <Card
                      key={timetable.idTimetable}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{timetable.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {timetable.className}
                            </p>
                          </div>
                          {getStatusBadge(timetable.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-4">
                          <p>
                            Du{' '}
                            {new Date(timetable.startDate).toLocaleDateString()}
                          </p>
                          <p>
                            Au{' '}
                            {new Date(timetable.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTimetable(timetable);
                              loadTimetableEntries(timetable.idTimetable);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          {timetable.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                publishTimetable(timetable.idTimetable)
                              }
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Publier
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deleteTimetable(timetable.idTimetable)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails de l'emploi du temps sélectionné */}
          {selectedTimetable && (
            <Card>
              <CardHeader>
                <CardTitle>Détails: {selectedTimetable.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {groupTimeSlotsByDay(timeSlots).map(({ day, dayName }) => (
                    <div key={day}>
                      <h4 className="font-medium mb-2">{dayName}</h4>
                      <div className="grid gap-2 ml-4">
                        {timetableEntries
                          .filter((entry) => entry.timeSlot.dayOfWeek === day)
                          .map((entry) => (
                            <div
                              key={entry.idTimetableEntry}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm">
                                    {entry.timeSlot.startTime} -{' '}
                                    {entry.timeSlot.endTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm">
                                    {entry.subjectName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">
                                    {entry.classroomName}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {entry.teacherName}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Générer un emploi du temps */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Générer un Nouvel Emploi du Temps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="classId">Classe</Label>
                  <Select
                    onValueChange={(value) =>
                      setGenerationForm({
                        ...generationForm,
                        classId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((classe) => (
                        <SelectItem
                          key={classe.idClass}
                          value={classe.idClass.toString()}
                        >
                          {classe.name} - {classe.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    type="date"
                    value={generationForm.startDate}
                    onChange={(e) =>
                      setGenerationForm({
                        ...generationForm,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    type="date"
                    value={generationForm.endDate}
                    onChange={(e) =>
                      setGenerationForm({
                        ...generationForm,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Heures par matière (par semaine)</Label>
                <div className="grid gap-2 mt-2">
                  {subjects?.map((subject) => (
                    <div
                      key={subject.idSubject}
                      className="flex items-center gap-2"
                    >
                      <span className="w-32 text-sm">{subject.name}:</span>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        className="w-20"
                        onChange={(e) =>
                          setGenerationForm({
                            ...generationForm,
                            subjectHours: {
                              ...generationForm.subjectHours,
                              [subject.idSubject?.toString() || '0']:
                                parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        heures/semaine
                      </span>
                    </div>
                  ))}
                  {(!subjects || subjects.length === 0) && (
                    <div className="text-sm text-muted-foreground">
                      Aucune matière disponible. Veuillez d'abord créer des
                      matières.
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={generateTimetable}
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? 'Génération en cours...'
                  : "Générer l'Emploi du Temps"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Créneaux horaires */}
        <TabsContent value="timeslots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Créneaux Horaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Aucun créneau horaire configuré
                  </p>
                  <Button onClick={initializeTimeSlots}>
                    Initialiser les créneaux par défaut
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupTimeSlotsByDay(timeSlots).map(
                    ({ day, dayName, slots }) => (
                      <div key={day}>
                        <h4 className="font-medium mb-2">{dayName}</h4>
                        <div className="grid gap-2 ml-4">
                          {slots.map((slot) => (
                            <div
                              key={slot.idTimeSlot}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div>
                                <span className="font-medium">{slot.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              {slot.description && (
                                <span className="text-sm text-muted-foreground">
                                  {slot.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des disponibilités */}
        <TabsContent value="availability" className="space-y-6">
          <AvailabilityManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimetablePage;
