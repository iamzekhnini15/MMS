import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus } from 'lucide-react';
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

  return (
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">{course.name}</h1>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-lg"
        >
          <Plus className="w-5 h-5" />
          Ajouter une matière
        </Button>
      </div>

      {/* Subject Bubbles */}
      <div className="flex flex-col gap-4 max-w-7xl mx-auto">
        {subjects && subjects.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-2">
            {subjects.map((subject) => (
              <AccordionItem
                key={subject.idSubject}
                value={`item-${subject.idSubject}`}
                className="group"
              >
                <AccordionTrigger className="h-12 px-6 flex items-center justify-between text-left text-lg font-medium rounded-full cursor-pointer transition-all">
                  {subject.name}
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 space-y-2">
                  <p className="text-gray-700 mb-2">{subject.description}</p>
                  <span className="text-sm text-gray-500">
                    Coefficient : {subject.coefficient}
                  </span>
                  <div className="mt-4 space-y-2">
                    {/* Bouton d'ajout de fichier - visible seulement pour les admins */}
                    {isAdmin && (
                      <Button onClick={() => openFileUpload(subject.idSubject!)}>
                        <Plus className="w-4 h-4 mr-1" /> Ajouter un fichier
                      </Button>
                    )}

                    {/* Liste des fichiers */}
                    {files
                      ?.filter(
                        (file) => file.subject.idSubject === subject.idSubject,
                      )
                      .map((file) => (
                        <div
                          key={file.idFile}
                          className="flex items-center space-x-2"
                        >
                          {/* Bouton de visibilité - visible seulement pour les admins */}
                          {isAdmin && (
                            <button
                              onClick={() =>
                                toggleFileVisibility(file.idFile, file.visible)
                              }
                            >
                              {file.visible ? (
                                <Eye className="w-5 h-5 text-green-500 hover:text-green-700 cursor-pointer" />
                              ) : (
                                <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                              )}
                            </button>
                          )}
                          {file.visible ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {file.name}
                            </a>
                          ) : (
                            <span className="text-gray-400 line-through">
                              {file.name}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-gray-500">
            Aucune matière disponible pour ce cours.
          </p>
        )}
      </div>

      {/* Modal pour ajouter une matière */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une matière</DialogTitle>
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
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour l'upload de fichiers */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ajouter un fichier</DialogTitle>
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
