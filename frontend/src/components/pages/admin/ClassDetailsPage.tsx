import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClasses } from '../../../contexts/ClassesContext';
import { useStudents } from '../../../contexts/StudentContext';
import { Address, Student, UserReceived } from '../../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
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

const ClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const { classes, fetchClasses } = useClasses();
  const { getAllStudentsForClass, addStudent, students } = useStudents();
  const [showForm, setShowForm] = useState(false);

  const [userForm, setUserForm] = useState<Student>({
    user: {
      email: '',
      password: '',
      lastname: '',
      firstname: '',
      phone: '',
      role: 'STUDENT',
      civility: '',
      address: {
        street: '',
        number: '',
        box: '',
        postalCode: '',
        commune: '',
        country: '',
      },
      idUser: 0,
    },
    dateOfBirth: '',
    classId: 0,
  });

  useEffect(() => {
    fetchClasses();
    if (id) getAllStudentsForClass(Number(id));
  }, [id]);

  const classe = classes?.find((c) => c.idClass === Number(id));
  if (!classe) return <p className="p-6 text-gray-600">Classe non trouvée.</p>;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field?: keyof Student | keyof UserReceived | keyof Address,
    nestedLevel?: 'student' | 'user' | 'address',
  ) {
    const value = e.target.value;
    setUserForm((prev) => {
      if (nestedLevel === 'address' && field && field in prev.user.address) {
        return {
          ...prev,
          user: {
            ...prev.user,
            address: { ...prev.user.address, [field]: value },
          },
        };
      } else if (nestedLevel === 'user' && field && field in prev.user) {
        return { ...prev, user: { ...prev.user, [field]: value } };
      } else if (nestedLevel === 'student' && field && field in prev) {
        return { ...prev, [field]: value };
      }
      return prev;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classe) return alert('Classe invalide');

    try {
      await addStudent({ ...userForm, classId: classe.idClass });
      setShowForm(false);
      resetForm();
      if (id) await getAllStudentsForClass(Number(id));
    } catch (error) {
      alert("Erreur lors de l'ajout de l'élève");
      console.error(error);
    }
  }

  function resetForm() {
    setUserForm({
      user: {
        idUser: 0,
        email: '',
        password: '',
        lastname: '',
        firstname: '',
        phone: '',
        role: 'STUDENT',
        civility: '',
        address: {
          street: '',
          number: '',
          box: '',
          postalCode: '',
          commune: '',
          country: '',
        },
      },
      dateOfBirth: '',
      classId: 0,
    });
  }

  return (
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">{classe.name}</h1>
          <div className="text-gray-700 text-lg">
            <p>
              <strong>Niveau:</strong> {classe.level}
            </p>
            <p>
              <strong>Département:</strong> {classe.department}
            </p>
            <p>
              <strong>Responsable:</strong>{' '}
              {classe.responsibleTeacher?.user?.firstname}{' '}
              {classe.responsibleTeacher?.user?.lastname}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-lg"
        >
          <Plus className="w-5 h-5" />
          Ajouter un élève
        </Button>
      </div>

      {/* Student Table */}
      <div className="max-w-7xl mx-auto">
        {students && students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.user.idUser}>
                  <TableCell>{student.user.firstname}</TableCell>
                  <TableCell>{student.user.lastname}</TableCell>
                  <TableCell>{student.user.email}</TableCell>
                  <TableCell>{student.user.phone || '-'}</TableCell>
                  <TableCell>{student.dateOfBirth}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline">
                        Modifier
                      </button>
                      <button className="text-red-600 hover:underline">
                        Supprimer
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">
            Aucun élève inscrit pour cette classe.
          </p>
        )}
      </div>

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Ajouter un élève</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Prénom', field: 'firstname' },
                { label: 'Nom', field: 'lastname' },
                { label: 'Email', field: 'email' },
                { label: 'Mot de passe', field: 'password' },
                { label: 'Téléphone', field: 'phone' },
                { label: 'Civilité', field: 'civility' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <Input
                    type={field === 'password' ? 'password' : 'text'}
                    value={userForm.user[field as keyof UserReceived] as string}
                    onChange={(e) => handleChange(e, field as any, 'user')}
                    required={[
                      'firstname',
                      'lastname',
                      'email',
                      'password',
                    ].includes(field)}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date de naissance
                </label>
                <Input
                  type="date"
                  value={userForm.dateOfBirth}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <h3 className="text-2xl font-semibold mt-6 mb-4">Adresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Rue', field: 'street' },
                { label: 'Numéro', field: 'number' },
                { label: 'Boîte', field: 'box' },
                { label: 'Code Postal', field: 'postalCode' },
                { label: 'Commune', field: 'commune' },
                { label: 'Pays', field: 'country' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <Input
                    type="text"
                    value={userForm.user.address[field as keyof Address]}
                    onChange={(e) => handleChange(e, field as any, 'address')}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" className="px-8 py-3 text-lg">
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassDetailPage;
