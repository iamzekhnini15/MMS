import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { SubjectContext } from '@/contexts/SubjectContext';
import { CoursesContext } from '@/contexts/CoursesContext';
import { UserContext } from '@/contexts/UserContext';
import { Subject } from '@/types';
import FileUpload from '@/components/FileUpload';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    subjects,
    files,
    fetchSubjectsByCourse,
    fetchAllFile,
    toggleFileVisibility,
    deleteFile,
    createSubject,
  } = useContext(SubjectContext);
  const { courses } = useContext(CoursesContext);
  const { authenticatedUser } = useContext(UserContext);

  // États pour l'upload de fichiers
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [subjectForm, setSubjectForm] = useState<Subject>({
    name: '',
    description: '',
    coefficient: 0,
    idCourse: 0,
  });

  useEffect(() => {
    if (id) {
      fetchSubjectsByCourse(Number(id));
      fetchAllFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const course = courses?.find((c) => c.idCourse === Number(id));

  // Vérifier si l'utilisateur est admin
  const isAdmin = authenticatedUser?.user?.role === 'ADMIN';

  // Ouvre la modal d'upload pour la matière cliquée
  function openFileUpload(subjectId: number) {
    setCurrentSubjectId(subjectId);
    setShowFileUpload(true);
  }

  // Ferme la modal d'upload
  function closeFileUpload() {
    setShowFileUpload(false);
    setCurrentSubjectId(null);
  }

  // Callback après ajout de fichier
  async function handleFileAdded() {
    if (id) {
      await fetchSubjectsByCourse(Number(id));
      await fetchAllFile();
    }
  }

  if (!course) return <p className="p-6 text-gray-600">Cours non trouvé.</p>;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSubjectForm((prev) => ({
      ...prev,
      [name]: name === 'coefficient' ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!course) return alert('Matière invalide');

    try {
      await createSubject({
        ...subjectForm,
        idCourse: course.idCourse,
      });
      setShowForm(false);
      resetForm();
    } catch (error) {
      alert("Erreur lors de l'ajout de la matière");
      console.error(error);
    }
  }

  function resetForm() {
    setSubjectForm({
      name: '',
      description: '',
      coefficient: 0,
      idCourse: 0,
    });
  }

  function renderFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return (
          <svg
            className="w-6 h-6 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#FAFAFA" />
            <path
              d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
              fill="#E11D48"
            />
            <text
              x="12"
              y="16"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
              fill="white"
            >
              PDF
            </text>
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg
            className="w-6 h-6 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#EFF6FF" />
            <path d="M6 3h12v18H6z" fill="#3B82F6" />
            <text
              x="12"
              y="16"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
              fill="white"
            >
              DOC
            </text>
          </svg>
        );
      case 'ppt':
      case 'pptx':
        return (
          <svg
            className="w-6 h-6 text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#FFF7ED" />
            <path d="M6 3h12v18H6z" fill="#FB923C" />
            <text
              x="12"
              y="16"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
              fill="white"
            >
              PPT
            </text>
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg
            className="w-6 h-6 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#ECFDF5" />
            <path d="M6 3h12v18H6z" fill="#16A34A" />
            <text
              x="12"
              y="16"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
              fill="white"
            >
              XLS
            </text>
          </svg>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return (
          <svg
            className="w-6 h-6 text-yellow-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#FFFBEB" />
            <circle cx="8" cy="8" r="2" fill="#F59E0B" />
            <path d="M3 17l4-5 3 4 5-7 4 8H3z" fill="#F59E0B" />
          </svg>
        );
      case 'txt':
        return (
          <svg
            className="w-6 h-6 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#F3F4F6" />
            <path d="M6 7h12v2H6zM6 11h12v2H6zM6 15h8v2H6z" fill="#374151" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="3" fill="#F8FAFC" />
            <path d="M6 3h12v18H6z" fill="#9CA3AF" />
          </svg>
        );
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {course.name}
          </h1>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Ajouter une matière
          </Button>
        )}
      </div>

      {/* Subject Accordions */}
      <div className="flex flex-col gap-4 max-w-7xl mx-auto">
        {subjects && subjects.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-2">
            {subjects.map((subject) => (
              <AccordionItem
                key={subject.idSubject}
                value={`item-${subject.idSubject}`}
                className="group bg-white dark:bg-neutral-900 rounded-lg border dark:border-neutral-800 shadow-sm"
              >
                <AccordionTrigger className="h-auto sm:h-12 px-4 sm:px-6 py-3 sm:py-0 flex items-center justify-between text-left text-base sm:text-lg font-medium cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-900 dark:text-white rounded-lg">
                  <span className="pr-2">{subject.name}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 py-4 space-y-3">
                  <p className="text-gray-700 text-sm sm:text-base">
                    {subject.description}
                  </p>
                  <span className="text-xs sm:text-sm text-gray-500 block">
                    Coefficient : {subject.coefficient}
                  </span>

                  <div className="mt-4 space-y-3">
                    {/* Bouton d'ajout de fichier - visible seulement pour les admins */}
                    {isAdmin && (
                      <Button
                        onClick={() => openFileUpload(subject.idSubject!)}
                        size="sm"
                        className="w-full sm:w-auto text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Ajouter un fichier
                      </Button>
                    )}

                    {/* Liste des fichiers */}
                    <div className="space-y-2">
                      {(isAdmin ? files : files?.filter((f) => f.visible))
                        ?.filter(
                          (file) =>
                            file.subject.idSubject === subject.idSubject,
                        )
                        .map((file) => (
                          <div
                            key={file.idFile}
                            className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-neutral-900 rounded-md"
                          >
                            {/* Bouton de visibilité - visible seulement pour les admins */}
                            {isAdmin && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    toggleFileVisibility(
                                      file.idFile,
                                      file.visible,
                                    )
                                  }
                                  className="flex-shrink-0"
                                >
                                  {file.visible ? (
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 hover:text-green-700 cursor-pointer" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                  )}
                                </button>
                                <button
                                  onClick={async () => {
                                    if (
                                      !confirm(
                                        'Voulez-vous vraiment supprimer ce fichier ?',
                                      )
                                    )
                                      return;
                                    try {
                                      await deleteFile(file.idFile);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="flex-shrink-0"
                                >
                                  <Trash className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 hover:text-red-700 cursor-pointer" />
                                </button>
                              </div>
                            )}
                            {/* For non-admins, only visible files are present; show link */}
                            <div className="flex items-center flex-1 space-x-3">
                              <div className="flex-shrink-0">
                                {renderFileIcon(file.name)}
                              </div>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm sm:text-base break-all ${file.visible ? 'text-blue-500 hover:underline' : 'text-gray-400 line-through'}`}
                              >
                                {file.name}
                              </a>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Aucune matière disponible pour ce cours.
          </p>
        )}
      </div>

      {/* Modal pour ajouter une matière */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Ajouter une matière
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom de la matière
              </label>
              <Input
                id="name"
                name="name"
                value={subjectForm.name}
                onChange={handleChange}
                placeholder="Entrez le nom de la matière"
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                name="description"
                value={subjectForm.description}
                onChange={handleChange}
                placeholder="Entrez la description"
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="coefficient" className="text-sm font-medium">
                Coefficient
              </label>
              <Input
                id="coefficient"
                name="coefficient"
                type="number"
                value={subjectForm.coefficient}
                onChange={handleChange}
                placeholder="Entrez le coefficient"
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="order-2 sm:order-1 text-sm sm:text-base"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="order-1 sm:order-2 text-sm sm:text-base"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour l'upload de fichiers */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="sm:max-w-[700px] mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Ajouter un fichier
            </DialogTitle>
          </DialogHeader>
          {currentSubjectId && (
            <FileUpload
              subjectId={currentSubjectId}
              onFileAdded={handleFileAdded}
              onClose={closeFileUpload}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
