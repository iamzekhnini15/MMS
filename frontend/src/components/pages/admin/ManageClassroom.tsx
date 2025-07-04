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
  });

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
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">
          Gestion des salles de cours
        </h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-lg"
        >
          + Nouvelle salle
        </Button>
      </div>

      {/* Classes Table */}
      <div className="max-w-7xl mx-auto">
        {classrooms && classrooms.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((classrooms) => (
                <TableRow
                  key={classrooms.idClassroom}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>{classrooms.name}</TableCell>
                  <TableCell>{classrooms.level}</TableCell>
                  <TableCell>{classrooms.capacity}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert('Modifier non implémenté');
                      }}
                    >
                      Supprimer
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
        <DialogContent className="max-w-3xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une classe</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {error && (
              <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Nom</label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Niveau</label>
                <Input
                  name="level"
                  type="number"
                  value={form.level}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Capacité</label>
                <Input
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
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

export default ManageClassroom;
