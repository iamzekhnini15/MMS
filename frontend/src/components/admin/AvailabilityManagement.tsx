import React, { useState, useEffect, useContext } from 'react';
import { Plus, Trash2, Clock, Users, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

// Import des contextes
import { TeacherContext } from '@/contexts/TeacherContext';
import { ClassroomContext } from '@/contexts/ClassroomContext';

interface TeacherAvailability {
  idTeacherAvailability: number;
  teacherId: number;
  teacherName?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ClassroomAvailability {
  idClassroomAvailability: number;
  classroomId: number;
  classroomName?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const AvailabilityManagement: React.FC = () => {
  // Contextes
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);

  // État local
  const [teacherAvailabilities, setTeacherAvailabilities] = useState<
    TeacherAvailability[]
  >([]);
  const [classroomAvailabilities, setClassroomAvailabilities] = useState<
    ClassroomAvailability[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [teacherForm, setTeacherForm] = useState({
    teacherId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  const [classroomForm, setClassroomForm] = useState({
    classroomId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  const API_BASE = 'http://localhost:3000';

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Lundi' },
    { value: 'TUESDAY', label: 'Mardi' },
    { value: 'WEDNESDAY', label: 'Mercredi' },
    { value: 'THURSDAY', label: 'Jeudi' },
    { value: 'FRIDAY', label: 'Vendredi' },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadTeacherAvailabilities(),
      loadClassroomAvailabilities(),
    ]);
  };

  const loadTeacherAvailabilities = async () => {
    try {
      // Pour l'instant, on va charger toutes les disponibilités
      // Plus tard on peut optimiser avec une route dédiée
      setTeacherAvailabilities([]);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des disponibilités professeurs:',
        error,
      );
    }
  };

  const loadClassroomAvailabilities = async () => {
    try {
      setClassroomAvailabilities([]);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des disponibilités salles:',
        error,
      );
    }
  };

  const createTeacherAvailability = async () => {
    if (
      !teacherForm.teacherId ||
      !teacherForm.dayOfWeek ||
      !teacherForm.startTime ||
      !teacherForm.endTime
    ) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/availabilities/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: parseInt(teacherForm.teacherId),
          dayOfWeek: teacherForm.dayOfWeek,
          startTime: teacherForm.startTime,
          endTime: teacherForm.endTime,
        }),
      });

      if (response.ok) {
        await loadTeacherAvailabilities();
        setTeacherForm({
          teacherId: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
        });
        toast({
          title: 'Succès',
          description: 'Disponibilité professeur créée avec succès',
        });
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la disponibilité',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createClassroomAvailability = async () => {
    if (
      !classroomForm.classroomId ||
      !classroomForm.dayOfWeek ||
      !classroomForm.startTime ||
      !classroomForm.endTime
    ) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/availabilities/classrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: parseInt(classroomForm.classroomId),
          dayOfWeek: classroomForm.dayOfWeek,
          startTime: classroomForm.startTime,
          endTime: classroomForm.endTime,
        }),
      });

      if (response.ok) {
        await loadClassroomAvailabilities();
        setClassroomForm({
          classroomId: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
        });
        toast({
          title: 'Succès',
          description: 'Disponibilité salle créée avec succès',
        });
      } else {
        throw new Error('Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la disponibilité',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacherAvailability = async (
    teacherId: number,
    dayOfWeek: string,
    startTime: string,
  ) => {
    try {
      await fetch(
        `${API_BASE}/availabilities/teachers/${teacherId}/${dayOfWeek}/${startTime}`,
        {
          method: 'DELETE',
        },
      );
      await loadTeacherAvailabilities();
      toast({
        title: 'Succès',
        description: 'Disponibilité professeur supprimée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const deleteClassroomAvailability = async (
    classroomId: number,
    dayOfWeek: string,
    startTime: string,
  ) => {
    try {
      await fetch(
        `${API_BASE}/availabilities/classrooms/${classroomId}/${dayOfWeek}/${startTime}`,
        {
          method: 'DELETE',
        },
      );
      await loadClassroomAvailabilities();
      toast({
        title: 'Succès',
        description: 'Disponibilité salle supprimée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const getDayLabel = (day: string) => {
    const dayMap = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
    };
    return dayMap[day as keyof typeof dayMap] || day;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Disponibilités Professeurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Disponibilités Professeurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="teacher">Professeur</Label>
                <Select
                  onValueChange={(value) =>
                    setTeacherForm({ ...teacherForm, teacherId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un professeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.idTeacher}
                        value={teacher.idTeacher.toString()}
                      >
                        {teacher.user.firstname} {teacher.user.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day">Jour</Label>
                <Select
                  onValueChange={(value) =>
                    setTeacherForm({ ...teacherForm, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Heure début</Label>
                  <Input
                    type="time"
                    value={teacherForm.startTime}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Heure fin</Label>
                  <Input
                    type="time"
                    value={teacherForm.endTime}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={createTeacherAvailability}
                disabled={loading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Disponibilité
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Disponibilités existantes</h4>
              {teacherAvailabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune disponibilité définie
                </p>
              ) : (
                <div className="space-y-1">
                  {teacherAvailabilities.map((availability) => (
                    <div
                      key={availability.idTeacherAvailability}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {availability.teacherName}
                        </Badge>
                        <span className="text-sm">
                          {getDayLabel(availability.dayOfWeek)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">
                            {availability.startTime} - {availability.endTime}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          deleteTeacherAvailability(
                            availability.teacherId,
                            availability.dayOfWeek,
                            availability.startTime,
                          )
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disponibilités Salles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Disponibilités Salles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="classroom">Salle</Label>
                <Select
                  onValueChange={(value) =>
                    setClassroomForm({ ...classroomForm, classroomId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une salle" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms?.map((classroom) => (
                      <SelectItem
                        key={classroom.idClassroom}
                        value={classroom.idClassroom.toString()}
                      >
                        {classroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day">Jour</Label>
                <Select
                  onValueChange={(value) =>
                    setClassroomForm({ ...classroomForm, dayOfWeek: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Heure début</Label>
                  <Input
                    type="time"
                    value={classroomForm.startTime}
                    onChange={(e) =>
                      setClassroomForm({
                        ...classroomForm,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Heure fin</Label>
                  <Input
                    type="time"
                    value={classroomForm.endTime}
                    onChange={(e) =>
                      setClassroomForm({
                        ...classroomForm,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={createClassroomAvailability}
                disabled={loading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Disponibilité
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Disponibilités existantes</h4>
              {classroomAvailabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune disponibilité définie
                </p>
              ) : (
                <div className="space-y-1">
                  {classroomAvailabilities.map((availability) => (
                    <div
                      key={availability.idClassroomAvailability}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {availability.classroomName}
                        </Badge>
                        <span className="text-sm">
                          {getDayLabel(availability.dayOfWeek)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">
                            {availability.startTime} - {availability.endTime}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          deleteClassroomAvailability(
                            availability.classroomId,
                            availability.dayOfWeek,
                            availability.startTime,
                          )
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityManagement;
