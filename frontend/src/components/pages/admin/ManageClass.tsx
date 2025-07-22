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
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">
          Gestion des classes
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-lg"
        >
          + Nouvelle classe
        </Button>
      </div>

      {/* Classes Table */}
      <div className="max-w-7xl mx-auto">
        {classes && classes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classe) => (
                <TableRow
                  key={classe.idClass}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/manage-classes/${classe.idClass}`)}
                >
                  <TableCell>{classe.name}</TableCell>
                  <TableCell>{classe.level}</TableCell>
                  <TableCell>{classe.department}</TableCell>
                  <TableCell>
                    {classe.responsibleTeacher?.user?.firstname}{' '}
                    {classe.responsibleTeacher?.user?.lastname}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Modifier non implémenté');
                      }}
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">Aucune classe disponible.</p>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl bg-black/30">
          <DialogHeader>
            <DialogTitle>Ajouter une classe</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {error && (
              <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">
                  Nom
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="level" className="block mb-1 font-medium">
                  Niveau
                </label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={form.level}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="department" className="block mb-1 font-medium">
                  Département
                </label>
                <Input
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="responsibleTeacherId"
                  className="block mb-1 font-medium"
                >
                  Responsable
                </label>
                <Select
                  onValueChange={handleTeacherSelect}
                  value={form.responsibleTeacherId}
                >
                  <SelectTrigger id="responsibleTeacherId" className="w-full">
                    <SelectValue placeholder="Sélectionnez un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem
                        key={teacher.idTeacher}
                        value={String(teacher.idTeacher)}
                      >
                        {teacher.user.firstname} {teacher.user.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="px-8 py-3 text-lg"
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
