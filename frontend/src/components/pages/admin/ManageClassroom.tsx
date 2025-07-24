import React, { useState, useEffect, useContext } from 'react';
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
import { ClassroomContext } from '@/contexts/ClassroomContext';

const ManageClassroom: React.FC = () => {
  const { fetchClassrooms, classrooms, createClassroom } =
    useContext(ClassroomContext);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    level: '',
    capacity: '',
  });

  useEffect(() => {
    fetchClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);
    try {
      await createClassroom({
        name: form.name.trim(),
        level: Number(form.level),
        capacity: form.capacity.trim(),
      });

      setShowModal(false);
      setForm({ name: '', level: '', capacity: '' });
    } catch (err) {
      setError('Erreur lors de la création de la classe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Gestion des salles de cours
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm sm:text-base lg:text-lg self-start sm:self-auto"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Nouvelle salle</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Classes Table */}
      <div className="max-w-7xl mx-auto">
        {classrooms && classrooms.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Nom</TableHead>
                  <TableHead className="text-xs sm:text-sm">Niveau</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Capacité</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classrooms) => (
                  <TableRow
                    key={classrooms.idClassroom}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="text-xs sm:text-sm font-medium">
                      <div>
                        <div>{classrooms.name}</div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          Capacité: {classrooms.capacity}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{classrooms.level}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{classrooms.capacity}</TableCell>
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
                        <span className="hidden sm:inline">Supprimer</span>
                        <span className="sm:hidden">🗑️</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-500">Aucune salle disponible.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">Ajouter une salle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="text-red-600 bg-red-100 p-2 sm:p-3 rounded text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm">Nom</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Niveau</label>
                <Input
                  name="level"
                  type="number"
                  value={form.level}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm">Capacité</label>
                <Input
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
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

export default ManageClassroom;
