import React, { useState, useEffect, useContext } from 'react';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { Teacher, Classroom } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const ManageClass: React.FC = () => {
  const { classes, fetchClasses, createClass } = useContext(ClassesContext);
  const { teachers } = useContext(TeacherContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    level: '',
    department: '',
    responsibleTeacherId: '',
  });

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTeacherSelect(value: string) {
    setForm((prev) => ({ ...prev, responsibleTeacherId: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    if (!form.level.trim() || isNaN(Number(form.level))) {
      setError('Le niveau doit être un nombre valide');
      return;
    }
    if (!form.department.trim()) {
      setError('Le département est obligatoire');
      return;
    }
    if (!form.responsibleTeacherId) {
      setError('Le responsable est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const responsibleTeacher = teachers?.find(
        (t) => t.idTeacher === Number(form.responsibleTeacherId),
      );
      if (!responsibleTeacher) throw new Error('Responsable invalide');

      await createClass({
        name: form.name.trim(),
        level: Number(form.level),
        department: form.department.trim(),
        responsibleTeacher,
        courses: {
          idCourse: 0,
          classroom: {} as Classroom,
          teacher: {} as Teacher,
          startDateTime: '',
          endDateTime: '',
          name: '',
        },
      });

      await fetchClasses();
      setShowModal(false);
      setForm({
        name: '',
        level: '',
        department: '',
        responsibleTeacherId: '',
      });
    } catch (err) {
      setError('Erreur lors de la création de la classe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-background dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Gestion des classes
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm sm:text-base lg:text-lg self-start sm:self-auto"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Nouvelle classe</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Classes Table */}
      <div className="max-w-7xl mx-auto">
        {classes && classes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Nom</TableHead>
                  <TableHead className="text-xs sm:text-sm">Niveau</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Département</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Responsable</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classe) => (
                  <TableRow
                    key={classe.idClass}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900"
                    onClick={() => navigate(`/manage-classes/${classe.idClass}`)}
                  >
                    <TableCell className="text-xs sm:text-sm font-medium">
                      <div>
                        <div>{classe.name}</div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          Niv. {classe.level} • {classe.department}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{classe.level}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{classe.department}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <div className="truncate max-w-32">
                        {classe.responsibleTeacher?.user?.firstname}{' '}
                        {classe.responsibleTeacher?.user?.lastname}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-2 sm:px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Modifier non implémenté');
                        }}
                      >
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">✏️</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-500">Aucune classe disponible.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">Ajouter une classe</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="text-red-600 bg-red-100 dark:bg-neutral-900 p-2 sm:p-3 rounded text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium text-sm">
                  Nom
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label htmlFor="level" className="block mb-1 font-medium text-sm">
                  Niveau
                </label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={form.level}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label htmlFor="department" className="block mb-1 font-medium text-sm">
                  Département
                </label>
                <Input
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="responsibleTeacherId"
                  className="block mb-1 font-medium text-sm"
                >
                  Responsable
                </label>
                <Select
                  onValueChange={handleTeacherSelect}
                  value={form.responsibleTeacherId}
                >
                  <SelectTrigger id="responsibleTeacherId" className="w-full text-sm">
                    <SelectValue placeholder="Sélectionnez un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.idTeacher}
                        value={String(teacher.idTeacher)}
                        className="text-sm"
                      >
                        {teacher.user.firstname} {teacher.user.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="text-sm sm:mr-2"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="text-sm sm:px-8"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageClass;
