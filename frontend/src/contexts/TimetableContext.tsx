import { createContext, useEffect, useState, ReactNode } from 'react';

// Types pour le système d'emploi du temps
interface TimeSlot {
  idTimeSlot: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

interface Timetable {
  idTimetable: number;
  name: string;
  classId: number;
  className?: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  createdAt?: string;
}

interface TimetableEntry {
  idEntry: number;
  timetableId: number;
  timeSlotId: number;
  courseId: number;
  teacherId: number;
  classroomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  courseName?: string;
  teacherName?: string;
  classroomName?: string;
}

interface GenerationRequest {
  classId: string;
  startDate: string;
  endDate: string;
  courseIds: number[];
}

// Types pour la vérification de conflits
interface ConflictCheckRequest {
  classId: number;
  courseId?: number;
  teacherId?: number;
  classroomId?: number;
  timeSlotId: number;
  excludeTimetableEntryId?: number;
}

interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflicts: string[];
  teacherUnavailable: boolean;
  classroomUnavailable: boolean;
  teacherAvailabilityReason?: string;
  classroomAvailabilityReason?: string;
}

// Types pour la vérification groupée (optimisée)
interface BulkAvailabilityRequest {
  classId: number;
  courseId?: number;
  teacherId?: number;
  classroomId?: number;
  timeSlotIds: number[];
  excludeTimetableEntryId?: number;
}

interface TimeSlotAvailability {
  available: boolean;
  reason: string;
  conflictType: 'NONE' | 'TEACHER_BUSY' | 'CLASSROOM_BUSY' | 'CLASS_BUSY' | 'TEACHER_UNAVAILABLE' | 'CLASSROOM_UNAVAILABLE';
}

interface BulkAvailabilityResponse {
  availabilities: { [timeSlotId: number]: TimeSlotAvailability };
}

interface BackendGenerationRequest {
  name: string;
  startDate: string;
  endDate: string;
  classRequirements: {
    classId: number;
    courses: {
      courseId: number;
      hoursPerWeek: number;
      preferredTeacherIds: number[];
      preferredClassroomIds: number[];
    }[];
  }[];
  options: {
    maxTimeoutSeconds: number;
    allowPartialSolution: boolean;
    priority: string;
  };
}

interface ManualTimetableRequest {
  name: string;
  description: string;
  entries: ManualTimetableEntry[];
}

interface ManualTimetableEntry {
  classId: number;
  courseId: number;
  teacherId: number;
  classroomId: number;
  timeSlotId: number;
}

interface TeacherAvailability {
  idAvailability: number;
  teacherId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  teacherName?: string;
}

interface ClassroomAvailability {
  idAvailability: number;
  classroomId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  classroomName?: string;
}

interface TimetableContextType {
  // État
  timetables: Timetable[] | null;
  timeSlots: TimeSlot[] | null;
  timetableEntries: TimetableEntry[] | null;
  teacherAvailabilities: TeacherAvailability[] | null;
  classroomAvailabilities: ClassroomAvailability[] | null;
  loading: boolean;
  error: string | null;

  // Actions Timetables
  fetchTimetables: () => Promise<void>;
  generateTimetable: (request: GenerationRequest) => Promise<void>;
  generateAdvancedTimetable: (
    request: BackendGenerationRequest,
  ) => Promise<void>;
  createManualTimetable: (request: ManualTimetableRequest) => Promise<void>;
  publishTimetable: (timetableId: number) => Promise<void>;
  deleteTimetable: (timetableId: number) => Promise<void>;

  // Actions TimeSlots
  fetchTimeSlots: () => Promise<void>;
  initializeTimeSlots: () => Promise<void>;

  // Actions TimetableEntries
  fetchTimetableEntries: (timetableId: number) => Promise<void>;
  fetchTimetableForClass: (classId: number) => Promise<TimetableEntry[]>;

  // Actions Availabilities
  fetchTeacherAvailabilities: () => Promise<void>;
  fetchClassroomAvailabilities: () => Promise<void>;
  createTeacherAvailability: (
    availability: Omit<TeacherAvailability, 'idAvailability'>,
  ) => Promise<void>;
  createClassroomAvailability: (
    availability: Omit<ClassroomAvailability, 'idAvailability'>,
  ) => Promise<void>;
  deleteTeacherAvailability: (id: number) => Promise<void>;
  deleteClassroomAvailability: (id: number) => Promise<void>;

  // Actions Conflicts
  checkConflicts: (request: ConflictCheckRequest) => Promise<ConflictCheckResponse>;
  checkBulkAvailability: (request: BulkAvailabilityRequest) => Promise<BulkAvailabilityResponse>;
}

const defaultContext: TimetableContextType = {
  timetables: null,
  timeSlots: null,
  timetableEntries: null,
  teacherAvailabilities: null,
  classroomAvailabilities: null,
  loading: false,
  error: null,
  fetchTimetables: async () => {},
  generateTimetable: async () => {},
  generateAdvancedTimetable: async () => {},
  createManualTimetable: async () => {},
  publishTimetable: async () => {},
  deleteTimetable: async () => {},
  fetchTimeSlots: async () => {},
  initializeTimeSlots: async () => {},
  fetchTimetableEntries: async () => {},
  fetchTimetableForClass: async () => {
    return [];
  },
  fetchTeacherAvailabilities: async () => {},
  fetchClassroomAvailabilities: async () => {},
  createTeacherAvailability: async () => {},
  createClassroomAvailability: async () => {},
  deleteTeacherAvailability: async () => {},
  deleteClassroomAvailability: async () => {},
  checkConflicts: async () => {
    return {
      hasConflicts: false,
      conflicts: [],
      teacherUnavailable: false,
      classroomUnavailable: false,
    };
  },
  checkBulkAvailability: async () => {
    return {
      availabilities: {},
    };
  },
};

const TimetableContext = createContext<TimetableContextType>(defaultContext);

const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const [timetables, setTimetables] = useState<Timetable[] | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[] | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<
    TimetableEntry[] | null
  >(null);
  const [teacherAvailabilities, setTeacherAvailabilities] = useState<
    TeacherAvailability[] | null
  >(null);
  const [classroomAvailabilities, setClassroomAvailabilities] = useState<
    ClassroomAvailability[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper pour gérer les erreurs — ne relance plus l'erreur pour éviter des rejets
  // non gérés qui peuvent laisser `loading` bloqué.
  const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    setError(message);
    // Ne pas relancer l'erreur ici ; les appels géreront le flux après setError.
  };

  // Actions Timetables
  const fetchTimetables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/timetables');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setTimetables(data);
    } catch (error) {
      handleError(error, 'Erreur lors du chargement des emplois du temps');
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = async (request: GenerationRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Transformer la requête au format attendu par le backend
      const backendRequest: BackendGenerationRequest = {
        name: `Emploi du temps - Classe ${request.classId}`,
        startDate: request.startDate,
        endDate: request.endDate,
        classRequirements: [
          {
            classId: parseInt(request.classId),
            courses: request.courseIds.map((courseId) => ({
              courseId: courseId,
              hoursPerWeek: 4, // Valeur par défaut, peut être personnalisée plus tard
              preferredTeacherIds: [], // Vide pour l'instant, peut être étendu
              preferredClassroomIds: [], // Vide pour l'instant, peut être étendu
            })),
          },
        ],
        options: {
          maxTimeoutSeconds: 30,
          allowPartialSolution: true,
          priority: 'BALANCED',
        },
      };

      const response = await fetch('/api/timetables/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendRequest),
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTimetables(); // Recharger la liste
    } catch (error) {
      handleError(error, "Erreur lors de la génération de l'emploi du temps");
    } finally {
      setLoading(false);
    }
  };

  const generateAdvancedTimetable = async (
    request: BackendGenerationRequest,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/timetables/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTimetables(); // Recharger la liste
    } catch (error) {
      handleError(error, "Erreur lors de la génération de l'emploi du temps");
    } finally {
      setLoading(false);
    }
  };

  const createManualTimetable = async (request: ManualTimetableRequest) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Payload envoyé:', JSON.stringify(request, null, 2));

      const response = await fetch('/api/timetables/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      console.log('Réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Erreur backend:', errorText);

        // Essayer de parser la réponse JSON pour extraire les détails d'erreur
        let errorDetails = null;
        try {
          errorDetails = JSON.parse(errorText);
        } catch (parseError) {
          console.log("Impossible de parser l'erreur JSON:", parseError);
        }

        const error = new Error(
          `Erreur API ${response.statusText}: ${errorText}`,
        );

        // Ajouter les détails d'erreur à l'objet Error (safe attach)
        if (errorDetails) {
          try {
            (error as unknown as { errorDetails?: unknown }).errorDetails =
              errorDetails;
          } catch {
            // noop
          }
        }

        // Si c'est une erreur de validation (400) avec des conflits détectés,
        // ne pas appeler le handler global pour éviter l'affichage d'un message
        // générique qui masque la modal de conflits côté composant.
        if (
          response.status === 400 &&
          errorDetails &&
          typeof errorDetails.error === 'string' &&
          errorDetails.error.includes('Conflits détectés')
        ) {
          // Relancer l'erreur pour que le composant puisse afficher la modal de conflits
          throw error;
        }

        // Pour les autres erreurs, utiliser le handler global puis relancer
        handleError(
          error,
          "Erreur lors de la création de l'emploi du temps manuel",
        );
        throw error; // Relancer l'erreur pour que le composant puisse la gérer
      }

      await fetchTimetables(); // Recharger la liste
    } catch (error) {
      if (error instanceof Error) {
        // Si c'est une erreur qu'on a déjà traitée (response.ok), on la relance
        if (error.message.includes('Erreur API')) {
          throw error;
        }
      }
      // Pour les autres erreurs (réseau, etc.)
      handleError(
        error,
        "Erreur lors de la création de l'emploi du temps manuel",
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const publishTimetable = async (timetableId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/timetables/${timetableId}/publish`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTimetables(); // Recharger la liste
    } catch (error) {
      handleError(error, 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const deleteTimetable = async (timetableId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/timetables/${timetableId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTimetables(); // Recharger la liste
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Actions TimeSlots
  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/timetables/time-slots');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setTimeSlots(data);
    } catch (error) {
      handleError(error, 'Erreur lors du chargement des créneaux horaires');
    } finally {
      setLoading(false);
    }
  };

  const initializeTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/timetables/time-slots/init', {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTimeSlots(); // Recharger la liste
    } catch (error) {
      handleError(error, "Erreur lors de l'initialisation des créneaux");
    } finally {
      setLoading(false);
    }
  };

  // Actions TimetableEntries
  const fetchTimetableEntries = async (timetableId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/timetables/${timetableId}/entries`);
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setTimetableEntries(data);
    } catch (error) {
      handleError(
        error,
        "Erreur lors du chargement des détails de l'emploi du temps",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetableForClass = async (
    classId: number,
  ): Promise<TimetableEntry[]> => {
    try {
      const response = await fetch(`/api/timetables/class/${classId}`);
      console.log('fetchTimetableForClass::response', response);
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      return data as TimetableEntry[];
    } catch (error) {
      console.error(
        "Erreur lors du chargement de l'emploi du temps de la classe:",
        error,
      );
      throw error;
    }
  };

  // Actions Teacher Availabilities
  const fetchTeacherAvailabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/availabilities/teacher');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setTeacherAvailabilities(data);
    } catch (error) {
      handleError(
        error,
        'Erreur lors du chargement des disponibilités des professeurs',
      );
    } finally {
      setLoading(false);
    }
  };

  const createTeacherAvailability = async (
    availability: Omit<TeacherAvailability, 'idAvailability'>,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/availabilities/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTeacherAvailabilities(); // Recharger la liste
    } catch (error) {
      handleError(
        error,
        'Erreur lors de la création de la disponibilité du professeur',
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacherAvailability = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/availabilities/teacher/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchTeacherAvailabilities(); // Recharger la liste
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la disponibilité');
    } finally {
      setLoading(false);
    }
  };

  // Actions Classroom Availabilities
  const fetchClassroomAvailabilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/availabilities/classroom');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      setClassroomAvailabilities(data);
    } catch (error) {
      handleError(
        error,
        'Erreur lors du chargement des disponibilités des salles',
      );
    } finally {
      setLoading(false);
    }
  };

  const createClassroomAvailability = async (
    availability: Omit<ClassroomAvailability, 'idAvailability'>,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/availabilities/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchClassroomAvailabilities(); // Recharger la liste
    } finally {
      setLoading(false);
    }
  };

  const deleteClassroomAvailability = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/availabilities/classroom/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      await fetchClassroomAvailabilities(); // Recharger la liste
    } catch (error) {
      handleError(error, 'Erreur lors de la suppression de la disponibilité');
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async (request: ConflictCheckRequest): Promise<ConflictCheckResponse> => {
    try {
      const response = await fetch('/api/timetables/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      // En cas d'erreur, on retourne un état d'erreur
      return {
        hasConflicts: true,
        conflicts: ['Erreur lors de la vérification des conflits'],
        teacherUnavailable: false,
        classroomUnavailable: false,
      };
    }
  };

  const checkBulkAvailability = async (request: BulkAvailabilityRequest): Promise<BulkAvailabilityResponse> => {
    try {
      const response = await fetch('/api/timetables/check-bulk-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification groupée des conflits:', error);
      // En cas d'erreur, on retourne un état d'erreur pour tous les créneaux
      const errorAvailabilities: { [timeSlotId: number]: TimeSlotAvailability } = {};
      request.timeSlotIds.forEach(timeSlotId => {
        errorAvailabilities[timeSlotId] = {
          available: false,
          reason: 'Erreur lors de la vérification des conflits',
          conflictType: 'NONE',
        };
      });
      
      return {
        availabilities: errorAvailabilities,
      };
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchTimetables();
    fetchTimeSlots();
    fetchTeacherAvailabilities();
    fetchClassroomAvailabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TimetableContext.Provider
      value={{
        timetables,
        timeSlots,
        timetableEntries,
        teacherAvailabilities,
        classroomAvailabilities,
        loading,
        error,
        fetchTimetables,
        generateTimetable,
        generateAdvancedTimetable,
        createManualTimetable,
        publishTimetable,
        deleteTimetable,
        fetchTimeSlots,
        initializeTimeSlots,
        fetchTimetableEntries,
        fetchTimetableForClass,
        fetchTeacherAvailabilities,
        fetchClassroomAvailabilities,
        createTeacherAvailability,
        createClassroomAvailability,
        deleteTeacherAvailability,
        deleteClassroomAvailability,
        checkConflicts,
        checkBulkAvailability,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

export { TimetableContext, TimetableProvider };
export type {
  TimeSlot,
  Timetable,
  TimetableEntry,
  GenerationRequest,
  ManualTimetableRequest,
  ManualTimetableEntry,
  TeacherAvailability,
  ClassroomAvailability,
  TimetableContextType,
  ConflictCheckRequest,
  ConflictCheckResponse,
  BulkAvailabilityRequest,
  BulkAvailabilityResponse,
  TimeSlotAvailability,
};
