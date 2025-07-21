import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Courses from './CoursesPage';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

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
  capacity: '30'
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
  endDateTime: '2024-05-15'
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
  coursesContext: any = mockCoursesContextValue,
  teacherContext: any = mockTeacherContextValue,
  classroomContext: any = mockClassroomContextValue
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
    </MemoryRouter>
  );
};

describe('CoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();
    mockConfirm.mockClear();
    mockConsoleLog.mockClear();
  });

  it('should render courses page with header', () => {
    renderPage();
    expect(screen.getByText('Gestion des cours')).toBeTruthy();
    expect(screen.getByText('Créez, modifiez et suivez les matières enseignées')).toBeTruthy();
    expect(screen.getByRole('button', { name: /nouveau cours/i })).toBeTruthy();
  });

  it('should show message when no courses available', () => {
    const emptyContext = {
      ...mockCoursesContextValue,
      courses: null,
    };
    renderPage(emptyContext);
    expect(screen.getByText('Aucun cours disponible.')).toBeTruthy();
  });

  it('should display course data in table', () => {
    renderPage();
    
    expect(screen.getByText('Programmation Web')).toBeTruthy();
    expect(screen.getByText('A1')).toBeTruthy();
    expect(screen.getByText('2024-01-15')).toBeTruthy();
    expect(screen.getByText('2024-05-15')).toBeTruthy();
    
    // Pour l'enseignant, vérifions avec un pattern plus flexible
    expect(screen.getByText(/Marie/)).toBeTruthy();
    expect(screen.getByText(/Dubois/)).toBeTruthy();
    
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeTruthy();
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

  it('should validate required fields and show alerts', async () => {
    renderPage();
    
    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));
    
    // Tenter de soumettre sans nom
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    
    expect(mockAlert).toHaveBeenCalledWith('Veuillez renseigner le nom du cours');
  });

  it('should create course successfully when all fields are filled', async () => {
    const createCourseMock = vi.fn().mockResolvedValue({});
    const contextWithCreate = {
      ...mockCoursesContextValue,
      createCourse: createCourseMock,
    };
    
    renderPage(contextWithCreate);
    
    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));
    
    // Remplir tous les champs requis
    fireEvent.change(screen.getByLabelText('Nom du cours'), { target: { value: 'Test Course' } });
    fireEvent.change(screen.getByLabelText('Salle de cours'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Enseignant'), { target: { value: '1' } });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    
    await waitFor(() => {
      expect(createCourseMock).toHaveBeenCalled();
    });
  });

  it('should delete course when confirmed', async () => {
    mockConfirm.mockReturnValue(true);
    const deleteCourseMock = vi.fn().mockResolvedValue({});
    const contextWithDelete = {
      ...mockCoursesContextValue,
      deleteCourses: deleteCourseMock,
    };
    
    renderPage(contextWithDelete);
    
    // Cliquer sur le bouton supprimer
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));
    
    expect(mockConfirm).toHaveBeenCalledWith('Supprimer ce cours ?');
    
    await waitFor(() => {
      expect(deleteCourseMock).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete course when confirmation is canceled', () => {
    mockConfirm.mockReturnValue(false);
    
    renderPage();
    
    // Cliquer sur le bouton supprimer
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));
    
    expect(mockConfirm).toHaveBeenCalledWith('Supprimer ce cours ?');
    expect(mockCoursesContextValue.deleteCourses).not.toHaveBeenCalled();
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

  it('should handle empty courses array', () => {
    const emptyCoursesContext = {
      ...mockCoursesContextValue,
      courses: [],
    };
    
    renderPage(emptyCoursesContext);
    
    // Les en-têtes du tableau devraient toujours être présents
    expect(screen.getByText('Nom du cours')).toBeTruthy();
    expect(screen.getByText('Salle de cours')).toBeTruthy();
    expect(screen.queryByText('Programmation Web')).toBeNull();
  });

  it('should handle form field changes', () => {
    renderPage();
    
    // Ouvrir le modal
    fireEvent.click(screen.getByRole('button', { name: /nouveau cours/i }));
    
    // Tester le changement des champs
    const nameInput = screen.getByLabelText('Nom du cours') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Nouveau Cours' } });
    expect(nameInput.value).toBe('Nouveau Cours');
    
    const classroomSelect = screen.getByLabelText('Salle de cours') as HTMLSelectElement;
    fireEvent.change(classroomSelect, { target: { value: '1' } });
    expect(classroomSelect.value).toBe('1');
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
});
