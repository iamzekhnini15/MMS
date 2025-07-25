import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Courses from './CoursesPage';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type {
  CoursesContextType,
  TeacherContextType,
  ClassroomContextType,
} from '../../../types';

// Mock des alertes globales
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock du window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

// Mock console.log
const mockConsoleLog = vi.fn();
global.console = { ...global.console, log: mockConsoleLog };

const mockClassroom = {
  idClassroom: 1,
  name: 'A1',
  level: 1,
  capacity: '30',
};

const mockTeacher = {
  idTeacher: 1,
  specialities: 'Développement Web',
  contractType: 'CDI',
  availability: 'Temps plein',
  isfullTime: true,
  user: {
    idUser: 1,
    firstname: 'Marie',
    lastname: 'Dubois',
    email: 'marie@example.com',
    phone: '0123456789',
    role: 'TEACHER',
    civility: 'Mme',
    password: '',
    address: {
      street: 'Rue du Prof',
      number: '10',
      box: '',
      postalCode: '1000',
      commune: 'Bruxelles',
      country: 'Belgique',
    },
  },
};

const mockCourse = {
  idCourse: 1,
  name: 'Programmation Web',
  classroom: mockClassroom,
  teacher: mockTeacher,
  startDateTime: '2024-01-15',
  endDateTime: '2024-05-15',
};

const mockCoursesContextValue = {
  courses: [mockCourse],
  loading: false,
  error: null as string | null,
  fetchCourses: vi.fn(),
  createCourse: vi.fn(),
  deleteCourses: vi.fn(),
};

const mockTeacherContextValue = {
  teachers: [mockTeacher],
  loading: false,
  error: null as string | null,
  fetchTeachers: vi.fn(),
  createTeacher: vi.fn(),
  deleteTeacher: vi.fn(),
};

const mockClassroomContextValue = {
  classrooms: [mockClassroom],
  loading: false,
  error: null as string | null,
  fetchClassrooms: vi.fn(),
  createClassroom: vi.fn(),
};

const renderPage = (
  coursesContext: CoursesContextType = mockCoursesContextValue,
  teacherContext: TeacherContextType = mockTeacherContextValue,
  classroomContext: ClassroomContextType = mockClassroomContextValue,
) => {
  return render(
    <MemoryRouter>
      <CoursesContext.Provider value={coursesContext}>
        <TeacherContext.Provider value={teacherContext}>
          <ClassroomContext.Provider value={classroomContext}>
            <Courses />
          </ClassroomContext.Provider>
        </TeacherContext.Provider>
      </CoursesContext.Provider>
    </MemoryRouter>,
  );
};

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();
    mockConfirm.mockClear();
    mockConsoleLog.mockClear();
  });

  it('should render courses page with header and table', () => {
    renderPage();

    expect(screen.getByText('Gestion des cours')).toBeTruthy();
    expect(
      screen.getByText('Créez, modifiez et suivez les matières enseignées'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /nouveau cours/i })).toBeTruthy();

    // Vérifier les en-têtes du tableau
    expect(screen.getByText('Nom du cours')).toBeTruthy();
    expect(screen.getByText('Salle de cours')).toBeTruthy();
    expect(screen.getByText('Date de début')).toBeTruthy();
    expect(screen.getByText('Date de fin')).toBeTruthy();
    expect(screen.getByText('Enseignant')).toBeTruthy();
    expect(screen.getByText('Actions')).toBeTruthy();
  });


  it('should show loading state', () => {
    const loadingContext = {
      ...mockCoursesContextValue,
      loading: true,
    };

    renderPage(loadingContext);

    expect(screen.getByText('Chargement des cours...')).toBeTruthy();
  });

  it('should show error state', () => {
    const errorContext = {
      ...mockCoursesContextValue,
      error: 'Erreur de chargement' as string | null,
    };

    renderPage(errorContext);

    expect(screen.getByText('Erreur de chargement')).toBeTruthy();
  });

  it('should show message when no courses available', () => {
    const emptyContext = {
      ...mockCoursesContextValue,
      courses: null,
    };

    renderPage(emptyContext);

    expect(screen.getByText('Aucun cours disponible.')).toBeTruthy();
  });

  it('should open and close course creation modal', () => {
    renderPage();

    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));

    expect(screen.getByText('Nouveau cours')).toBeTruthy();
    expect(screen.getByLabelText('Nom du cours')).toBeTruthy();

    // Fermer le modal avec le bouton X
    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Nouveau cours')).toBeNull();
  });

  it('should close modal with cancel button', () => {
    renderPage();

    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));

    expect(screen.getByText('Nouveau cours')).toBeTruthy();

    // Fermer avec le bouton Annuler
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));

    expect(screen.queryByText('Nouveau cours')).toBeNull();
  });

  it('should validate required fields and show alerts', async () => {
    renderPage();

    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));

    // Tenter de soumettre sans nom
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(mockAlert).toHaveBeenCalledWith(
      'Veuillez renseigner le nom du cours',
    );

    // Ajouter un nom mais pas de salle
    const nameInput = screen.getByLabelText('Nom du cours');
    fireEvent.change(nameInput, { target: { value: 'Test Course' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(mockAlert).toHaveBeenCalledWith(
      'Veuillez choisir une salle de cours',
    );

    // Ajouter une salle mais pas d'enseignant
    const classroomSelect = screen.getByLabelText('Salle de cours');
    fireEvent.change(classroomSelect, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(mockAlert).toHaveBeenCalledWith('Veuillez choisir un enseignant');
  });

  it('should create course successfully when all fields are filled', async () => {
    mockCoursesContextValue.createCourse.mockResolvedValue({});

    renderPage();

    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));

    // Remplir tous les champs requis
    fireEvent.change(screen.getByLabelText('Nom du cours'), {
      target: { value: 'Test Course' },
    });
    fireEvent.change(screen.getByLabelText('Salle de cours'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Enseignant'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Date de début'), {
      target: { value: '2024-02-01' },
    });
    fireEvent.change(screen.getByLabelText('Date de fin'), {
      target: { value: '2024-06-01' },
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => {
      expect(mockCoursesContextValue.createCourse).toHaveBeenCalledWith({
        idCourse: 0,
        name: 'Test Course',
        classroom: mockClassroom,
        teacher: mockTeacher,
        startDateTime: '2024-02-01',
        endDateTime: '2024-06-01',
      });
    });

    // Vérifier que le modal se ferme
    expect(screen.queryByText('Nouveau cours')).toBeNull();
  });

  it('should delete course when confirmed', async () => {
    mockConfirm.mockReturnValue(true);
    mockCoursesContextValue.deleteCourses.mockResolvedValue({});

    renderPage();

    // Cliquer sur le bouton supprimer
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(mockConfirm).toHaveBeenCalledWith('Supprimer ce cours ?');

    await waitFor(() => {
      expect(mockCoursesContextValue.deleteCourses).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete course when confirmation is canceled', async () => {
    mockConfirm.mockReturnValue(false);

    renderPage();

    // Cliquer sur le bouton supprimer
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));

    expect(mockConfirm).toHaveBeenCalledWith('Supprimer ce cours ?');
    expect(mockCoursesContextValue.deleteCourses).not.toHaveBeenCalled();
  });

  it('should handle courses with empty array', () => {
    const emptyCoursesContext = {
      ...mockCoursesContextValue,
      courses: [],
    };

    renderPage(emptyCoursesContext);

    // Le tableau devrait toujours être rendu mais sans contenu
    expect(screen.getByText('Nom du cours')).toBeTruthy(); // Header
    expect(screen.queryByText('Programmation Web')).toBeNull(); // Pas de cours
  });

  it('should fill and handle form changes for course fields', () => {
    renderPage();

    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));

    // Tester le champ nom
    const nameInput = screen.getByLabelText('Nom du cours') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Nouveau Cours Test' } });
    expect(nameInput.value).toBe('Nouveau Cours Test');

    // Tester la sélection de salle
    const classroomSelect = screen.getByLabelText(
      'Salle de cours',
    ) as HTMLSelectElement;
    fireEvent.change(classroomSelect, { target: { value: '1' } });
    expect(classroomSelect.value).toBe('1');

    // Tester la sélection d'enseignant
    const teacherSelect = screen.getByLabelText(
      'Enseignant',
    ) as HTMLSelectElement;
    fireEvent.change(teacherSelect, { target: { value: '1' } });
    expect(teacherSelect.value).toBe('1');

    // Tester les dates
    const startDateInput = screen.getByLabelText(
      'Date de début',
    ) as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    expect(startDateInput.value).toBe('2024-02-01');

    const endDateInput = screen.getByLabelText(
      'Date de fin',
    ) as HTMLInputElement;
    fireEvent.change(endDateInput, { target: { value: '2024-06-01' } });
    expect(endDateInput.value).toBe('2024-06-01');
  });
});
