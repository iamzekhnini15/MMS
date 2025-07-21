import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseDetailPage from './CourseDetailsPage';
import { SubjectContext } from '../../../contexts/SubjectContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { UserContext } from '../../../contexts/UserContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock des alertes globales
const mockAlert = vi.fn();
global.alert = mockAlert;

// Mock console.error
const mockConsoleError = vi.fn();
global.console = { ...global.console, error: mockConsoleError };

// Mock du composant FileUpload
vi.mock('../../FileUpload', () => ({
  default: ({ onFileAdded, onClose }: { onFileAdded: () => void; onClose: () => void }) => (
    <div data-testid="file-upload">
      <button onClick={onFileAdded}>Add File</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const mockCourse = {
  idCourse: 1,
  name: 'Programmation Web',
  classroom: {
    idClassroom: 1,
    name: 'A1',
    level: 1,
    capacity: '30'
  },
  teacher: {
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
  },
  startDateTime: '2024-01-15T10:00:00Z',
  endDateTime: '2024-01-15T12:00:00Z'
};

const mockSubject = {
  idSubject: 1,
  name: 'HTML/CSS',
  description: 'Introduction aux technologies web de base',
  coefficient: 3,
  idCourse: 1,
};

const mockFile = {
  idFile: 1,
  name: 'cours-html.pdf',
  url: 'https://example.com/cours-html.pdf',
  visible: true,
  subject: {
    idSubject: 1,
    name: 'HTML/CSS',
    description: 'Introduction aux technologies web de base',
    coefficient: 3,
    idCourse: 1,
  },
};

const mockUser = {
  token: 'fake-token',
  user: {
    idUser: 1,
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    phone: '0123456789',
    role: 'ADMIN',
    civility: 'M.',
    password: '',
    address: {
      street: 'Rue Admin',
      number: '1',
      box: '',
      postalCode: '1000',
      commune: 'Bruxelles',
      country: 'Belgique',
    },
  },
};

const mockTeacherUser = {
  token: 'fake-token',
  user: {
    idUser: 2,
    firstname: 'Teacher',
    lastname: 'User',
    email: 'teacher@example.com',
    phone: '0123456789',
    role: 'TEACHER',
    civility: 'M.',
    password: '',
    address: {
      street: 'Rue Teacher',
      number: '2',
      box: '',
      postalCode: '1000',
      commune: 'Bruxelles',
      country: 'Belgique',
    },
  },
};

const mockSubjectContextValue = {
  subjects: [mockSubject],
  files: [mockFile],
  loading: false,
  error: null,
  fetchSubject: vi.fn(),
  fetchSubjectsByCourse: vi.fn(),
  fetchAllFile: vi.fn(),
  toggleFileVisibility: vi.fn(),
  createSubject: vi.fn(),
};

const mockCoursesContextValue = {
  courses: [mockCourse],
  loading: false,
  error: null,
  fetchCourses: vi.fn(),
  createCourse: vi.fn(),
  deleteCourses: vi.fn(),
};

const mockUserContextValue = {
  authenticatedUser: mockUser,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
};

const renderPage = (userContext = mockUserContextValue) => {
  return render(
    <MemoryRouter initialEntries={['/admin/course/1']}>
      <CoursesContext.Provider value={mockCoursesContextValue}>
        <SubjectContext.Provider value={mockSubjectContextValue}>
          <UserContext.Provider value={userContext}>
            <Routes>
              <Route path="/admin/course/:id" element={<CourseDetailPage />} />
            </Routes>
          </UserContext.Provider>
        </SubjectContext.Provider>
      </CoursesContext.Provider>
    </MemoryRouter>
  );
};

describe('CourseDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();
    mockConsoleError.mockClear();
  });

  it('should render course details page', () => {
    renderPage();
    
    expect(screen.getByText('Programmation Web')).toBeTruthy();
    expect(screen.getByRole('button', { name: /ajouter une matière/i })).toBeTruthy();
  });

  it('should display subjects in accordion format', () => {
    renderPage();
    
    expect(screen.getByText('HTML/CSS')).toBeTruthy();
    
    // Cliquer pour ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    expect(screen.getByText('Introduction aux technologies web de base')).toBeTruthy();
    expect(screen.getByText('Coefficient : 3')).toBeTruthy();
  });

  it('should show message when no subjects available', () => {
    const emptySubjectContext = {
      ...mockSubjectContextValue,
      subjects: [],
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/1']}>
        <CoursesContext.Provider value={mockCoursesContextValue}>
          <SubjectContext.Provider value={emptySubjectContext}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Aucune matière disponible pour ce cours.')).toBeTruthy();
  });

  it('should handle course not found', () => {
    const emptyCoursesContext = {
      ...mockCoursesContextValue,
      courses: [],
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/999']}>
        <CoursesContext.Provider value={emptyCoursesContext}>
          <SubjectContext.Provider value={mockSubjectContextValue}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Cours non trouvé.')).toBeTruthy();
  });

  it('should show admin features when user is admin', async () => {
    renderPage();
    
    // Ouvrir l'accordion pour voir les boutons admin
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter un fichier/i })).toBeTruthy();
    });
    
    // Le bouton de visibilité devrait être présent (recherche par testid)
    const visibilityButtons = screen.getAllByRole('button');
    const eyeButton = visibilityButtons.find(button => 
      button.querySelector('svg') && !button.textContent?.includes('Ajouter')
    );
    expect(eyeButton).toBeTruthy();
  });

  it('should hide admin features when user is not admin', async () => {
    const teacherUserContext = {
      ...mockUserContextValue,
      authenticatedUser: mockTeacherUser,
    };
    
    renderPage(teacherUserContext);
    
    // Ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /ajouter un fichier/i })).toBeNull();
    });
  });

  it('should open and close add subject dialog', async () => {
    renderPage();
    
    // Ouvrir le dialog
    const addButton = screen.getByRole('button', { name: /ajouter une matière/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      // Utiliser getAllByText pour gérer les éléments multiples
      const dialogTitles = screen.getAllByText('Ajouter une matière');
      expect(dialogTitles.length).toBeGreaterThan(0);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Fermer le dialog
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should fill and handle form changes for subject fields', async () => {
    renderPage();
    
    // Ouvrir le formulaire
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Tester les champs du formulaire
    const nameInput = screen.getByLabelText('Nom de la matière') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'JavaScript' } });
    expect(nameInput.value).toBe('JavaScript');

    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    fireEvent.change(descriptionInput, { target: { value: 'Programmation JavaScript avancée' } });
    expect(descriptionInput.value).toBe('Programmation JavaScript avancée');

    const coefficientInput = screen.getByLabelText('Coefficient') as HTMLInputElement;
    fireEvent.change(coefficientInput, { target: { value: '4' } });
    expect(coefficientInput.value).toBe('4');
  });

  it('should submit form successfully', async () => {
    mockSubjectContextValue.createSubject.mockResolvedValue({});
    
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Remplir les champs requis
    fireEvent.change(screen.getByLabelText('Nom de la matière'), { target: { value: 'JavaScript' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Programmation JavaScript avancée' } });
    fireEvent.change(screen.getByLabelText('Coefficient'), { target: { value: '4' } });

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', { name: /ajouter$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubjectContextValue.createSubject).toHaveBeenCalledWith({
        name: 'JavaScript',
        description: 'Programmation JavaScript avancée',
        coefficient: 4,
        idCourse: 1,
      });
    });
  });

  it('should handle form submission error', async () => {
    mockSubjectContextValue.createSubject.mockRejectedValue(new Error('Erreur API'));
    
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Remplir les champs requis
    fireEvent.change(screen.getByLabelText('Nom de la matière'), { target: { value: 'JavaScript' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Programmation JavaScript avancée' } });
    fireEvent.change(screen.getByLabelText('Coefficient'), { target: { value: '4' } });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /ajouter$/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Erreur lors de l'ajout de la matière");
    });
  });

  it('should handle form submission without valid course', async () => {
    const invalidCourseContext = {
      ...mockCoursesContextValue,
      courses: [],
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/999']}>
        <CoursesContext.Provider value={invalidCourseContext}>
          <SubjectContext.Provider value={mockSubjectContextValue}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Cours non trouvé.')).toBeTruthy();
  });

  it('should call useEffect functions on mount', () => {
    renderPage();
    
    expect(mockSubjectContextValue.fetchSubjectsByCourse).toHaveBeenCalledWith(1);
    expect(mockSubjectContextValue.fetchAllFile).toHaveBeenCalled();
  });

  it('should open file upload dialog when admin clicks add file', async () => {
    renderPage();
    
    // Ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter un fichier/i })).toBeTruthy();
    });

    // Cliquer sur ajouter un fichier
    fireEvent.click(screen.getByRole('button', { name: /ajouter un fichier/i }));
    
    await waitFor(() => {
      // Utiliser getAllByText pour gérer les éléments multiples
      const dialogTitles = screen.getAllByText('Ajouter un fichier');
      expect(dialogTitles.length).toBeGreaterThan(0);
      expect(screen.getByTestId('file-upload')).toBeTruthy();
    });
  });

  it('should close file upload dialog', async () => {
    renderPage();
    
    // Ouvrir l'accordion et le dialog d'upload
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter un fichier/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /ajouter un fichier/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('file-upload')).toBeTruthy();
    });

    // Fermer le dialog via le composant FileUpload - utiliser getAllByText pour éviter l'ambiguïté
    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]); // Cliquer sur le premier bouton Close trouvé
    
    await waitFor(() => {
      expect(screen.queryByTestId('file-upload')).toBeNull();
    });
  });

  it('should handle file added callback', async () => {
    renderPage();
    
    // Ouvrir l'accordion et le dialog d'upload
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ajouter un fichier/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /ajouter un fichier/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('file-upload')).toBeTruthy();
    });

    // Simuler l'ajout d'un fichier
    fireEvent.click(screen.getByText('Add File'));
    
    await waitFor(() => {
      expect(mockSubjectContextValue.fetchSubjectsByCourse).toHaveBeenCalledWith(1);
      expect(mockSubjectContextValue.fetchAllFile).toHaveBeenCalled();
    });
  });

  it('should toggle file visibility', async () => {
    renderPage();
    
    // Ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    await waitFor(() => {
      expect(screen.getByText('cours-html.pdf')).toBeInTheDocument();
    });

    // Chercher le bouton qui contient l'icône Eye (basé sur le className)
    const visibilityButton = screen.getByText('cours-html.pdf')
      .closest('div')
      ?.querySelector('button:first-child');
    
    if (visibilityButton) {
      fireEvent.click(visibilityButton);
      
      await waitFor(() => {
        // Le mockFile a idFile: 1 et visible: true
        expect(mockSubjectContextValue.toggleFileVisibility).toHaveBeenCalledWith(1, true);
      });
    } else {
      throw new Error('Visibility button not found');
    }
  });

  it('should display files correctly based on visibility', () => {
    const hiddenFileContext = {
      ...mockSubjectContextValue,
      files: [{
        ...mockFile,
        visible: false,
      }],
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/1']}>
        <CoursesContext.Provider value={mockCoursesContextValue}>
          <SubjectContext.Provider value={hiddenFileContext}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    // Ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    // Le fichier devrait être affiché avec style line-through
    const fileElement = screen.getByText('cours-html.pdf');
    expect(fileElement.className).toContain('line-through');
  });

  it('should test form field validations', async () => {
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Vérifier que les champs requis ont l'attribut required
    const nameInput = screen.getByLabelText('Nom de la matière') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
    const coefficientInput = screen.getByLabelText('Coefficient') as HTMLInputElement;

    expect(nameInput.required).toBeTruthy();
    expect(descriptionInput.required).toBeTruthy();
    expect(coefficientInput.required).toBeTruthy();

    // Vérifier le type number pour le coefficient
    expect(coefficientInput.type).toBe('number');
  });

  it('should handle course submission with invalid course scenario', async () => {
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Simuler la perte du cours pendant la soumission en modifiant le contexte
    const invalidCourseContext = {
      ...mockCoursesContextValue,
      courses: [], // Plus de cours
    };

    // Re-render avec un cours vide
    render(
      <MemoryRouter initialEntries={['/admin/course/1']}>
        <CoursesContext.Provider value={invalidCourseContext}>
          <SubjectContext.Provider value={mockSubjectContextValue}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    // Le composant devrait maintenant afficher "Cours non trouvé."
    expect(screen.getByText('Cours non trouvé.')).toBeTruthy();
  });

  it('should reset form after successful submission', async () => {
    mockSubjectContextValue.createSubject.mockResolvedValue({});
    
    renderPage();
    
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText('Nom de la matière'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Coefficient'), { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /ajouter$/i }));

    // Attendre que le formulaire soit fermé et réinitialisé
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    // Rouvrir le formulaire pour vérifier qu'il est réinitialisé
    fireEvent.click(screen.getByRole('button', { name: /ajouter une matière/i }));
    
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Nom de la matière') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText('Description') as HTMLInputElement;
      const coefficientInput = screen.getByLabelText('Coefficient') as HTMLInputElement;
      
      expect(nameInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      expect(coefficientInput.value).toBe('0');
    });
  });

  it('should handle subjects with no files', () => {
    const noFilesContext = {
      ...mockSubjectContextValue,
      files: [],
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/1']}>
        <CoursesContext.Provider value={mockCoursesContextValue}>
          <SubjectContext.Provider value={noFilesContext}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    // Ouvrir l'accordion
    fireEvent.click(screen.getByText('HTML/CSS'));
    
    // Vérifier qu'aucun fichier n'est affiché
    expect(screen.queryByText('cours-html.pdf')).toBeNull();
    
    // Mais le bouton d'ajout de fichier devrait être présent pour l'admin
    expect(screen.getByRole('button', { name: /ajouter un fichier/i })).toBeTruthy();
  });

  it('should test edge case with null subjects and files', () => {
    const nullContext = {
      ...mockSubjectContextValue,
      subjects: null,
      files: null,
    };
    
    render(
      <MemoryRouter initialEntries={['/admin/course/1']}>
        <CoursesContext.Provider value={mockCoursesContextValue}>
          <SubjectContext.Provider value={nullContext}>
            <UserContext.Provider value={mockUserContextValue}>
              <Routes>
                <Route path="/admin/course/:id" element={<CourseDetailPage />} />
              </Routes>
            </UserContext.Provider>
          </SubjectContext.Provider>
        </CoursesContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Aucune matière disponible pour ce cours.')).toBeTruthy();
  });
});
