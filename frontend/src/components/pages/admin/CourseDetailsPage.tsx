import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useSubject } from '@/contexts/SubjectContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Subject } from '@/types';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { subjects, files, fetchSubjectsByCourse, fetchAllFile, toggleFileVisibility, createSubject } = useSubject();
  const { courses } = useCourses();

  // --- Nouveaux états pour modal ajout fichier ---
  const [showFileForm, setShowFileForm] = useState(false);
  const [fileForm, setFileForm] = useState({ name: '', url: '' });
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);

  // Pour choisir entre url ou fichier local
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  }, []);

  const course = courses?.find((c) => c.idCourse === Number(id));
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



  // Gestion changement input (URL ou fichier)
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (inputType === 'url') {
      const { value } = e.target;
      setFileForm(prev => ({ ...prev, url: value }));
    } else if (inputType === 'file') {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setSelectedFile(file);
        setFileForm(prev => ({ ...prev, name: file.name }));
      }
    }
  }

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentSubjectId) {
      alert('Matière invalide');
      return;
    }

    try {
      let response;

      if (inputType === 'url') {
        if (!fileForm.url || !fileForm.name) {
          alert('Veuillez fournir un nom et une URL valides.');
          return;
        }
        // Envoi JSON avec url et nom
        response = await fetch(`/api/subject/${currentSubjectId}/addFile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fileForm),
        });
      } else if (inputType === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', selectedFile.name);

        response = await fetch(`/api/subject/${currentSubjectId}/addFile`, {
          method: 'POST',
          body: formData, // fetch gère automatiquement le content-type
        });
      } else {
        alert('Veuillez sélectionner un fichier ou entrer une URL valide.');
        return;
      }

      if (!response.ok) throw new Error('Erreur lors de l\'ajout du fichier');

      await fetchSubjectsByCourse(Number(id));
      await fetchAllFile();
      setShowFileForm(false);
      setFileForm({ name: '', url: '' });
      setSelectedFile(null);
      setInputType('url');
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue lors de l\'ajout du fichier.');
    }
  }

  // Ouvre la modal fichier pour la matière cliquée
  function openFileForm(subjectId: number) {
    setCurrentSubjectId(subjectId);
    setShowFileForm(true);
    setFileForm({ name: '', url: '' });
    setSelectedFile(null);
    setInputType('url');
  }





  return (
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">{course.name}</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-lg">
          <Plus className="w-5 h-5" />
          Ajouter une matière
        </Button>
      </div>

      {/* Subject Bubbles */}
      <div className="flex flex-col gap-4 max-w-7xl mx-auto">
        {subjects && subjects.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-2">
            {subjects.map(subject => (
              <AccordionItem key={subject.idSubject} value={`item-${subject.idSubject}`} className="group">
                <AccordionTrigger className="h-12 px-6 flex items-center justify-between text-left text-lg font-medium rounded-full cursor-pointer transition-all">
                  {subject.name}
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 space-y-2">
                  <p className="text-gray-700 mb-2">{subject.description}</p>
                  <span className="text-sm text-gray-500">Coefficient : {subject.coefficient}</span>
                  <div className="mt-4 space-y-2">
                    <Button onClick={() => openFileForm(subject.idSubject!)}>
                      <Plus className="w-4 h-4 mr-1" /> Ajouter un fichier
                    </Button>

                    {files
                      ?.filter(file => file.subject.idSubject === subject.idSubject)
                      .map(file => (
                        <div key={file.idFile} className="flex items-center space-x-2">
                          <button onClick={() => toggleFileVisibility(file.idFile, file.visible)}>
                            {file.visible ? (
                              <Eye className="w-5 h-5 text-green-500 hover:text-green-700 cursor-pointer" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                            )}
                          </button>
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
                            <span className="text-gray-400 line-through">{file.name}</span>
                          )}
                        </div>
                      ))}


                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-center text-gray-500">Aucune matière pour ce cours.</p>
        )}
      </div>

      {/* Modal Formulaire ajout fichier */}
      <Dialog open={showFileForm} onOpenChange={setShowFileForm}>
        <DialogContent className="max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Ajouter un fichier à la matière</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du fichier</label>
              <Input
                type="text"
                name="name"
                value={fileForm.name}
                onChange={e => setFileForm(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={inputType === 'file'} // nom auto si fichier local choisi
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type d'ajout</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="url"
                    checked={inputType === 'url'}
                    onChange={() => {
                      setInputType('url');
                      setSelectedFile(null);
                      setFileForm(prev => ({ ...prev, url: '' }));
                    }}
                  />
                  <span>URL</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value="file"
                    checked={inputType === 'file'}
                    onChange={() => {
                      setInputType('file');
                      setFileForm(prev => ({ ...prev, url: '' }));
                    }}
                  />
                  <span>Fichier local</span>
                </label>
              </div>
            </div>

            {inputType === 'url' && (
              <div>
                <label className="block text-sm font-medium mb-1">URL du fichier</label>
                <Input
                  type="url"
                  name="url"
                  value={fileForm.url}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            {inputType === 'file' && (
              <div>
                <label className="block text-sm font-medium mb-1">Choisir un fichier</label>
                <input
                  type="file"
                  name="file"
                  accept="*/*"
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button type="submit" className="px-8 py-3 text-lg">
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Formulaire ajout matière */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une matière</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la matière</label>
              <Input
                type="text"
                name="name"
                value={subjectForm.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                type="text"
                name="description"
                value={subjectForm.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coefficient</label>
              <Input
                type="number"
                name="coefficient"
                value={subjectForm.coefficient}
                onChange={handleChange}
                required
                min={0}
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
    </div>
  );
};

export default CourseDetailPage;
