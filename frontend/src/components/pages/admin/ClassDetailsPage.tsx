import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { StudentContext } from '../../../contexts/StudentContext';
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

type UserField = keyof UserReceived;

const userFields: { label: string; field: UserField }[] = [
  { label: 'Prénom', field: 'firstname' },
  { label: 'Nom', field: 'lastname' },
  { label: 'Email', field: 'email' },
  { label: 'Mot de passe', field: 'password' },
  { label: 'Téléphone', field: 'phone' },
  { label: 'Civilité', field: 'civility' },
];

const ClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const { classes, fetchClasses } = useContext(ClassesContext);
  const { getAllStudentsForClass, addStudent, students } =
    useContext(StudentContext);
  const [showForm, setShowForm] = useState(false);

  const [userForm, setUserForm] = useState<Student>({
    idStudent: 0, // Ajout de l'ID étudiant requis
    user: {
      idUser: 0,
      email: '',
      password: '',
      lastname: '',
      firstname: '',
      phone: '',
      role: 'STUDENT',
      civility: 'MR',
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

  useEffect(() => {
    fetchClasses();
    if (id) getAllStudentsForClass(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      idStudent: 0, // Ajout de l'ID étudiant requis
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{classe.name}</h1>
          <div className="text-gray-700 text-sm sm:text-base lg:text-lg space-y-1">
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
          className="flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Ajouter un élève
        </Button>
      </div>

      {/* Student Table */}
      <div className="max-w-7xl mx-auto">
        {students && students.length > 0 ? (
          <>
            {/* Desktop/Tablet Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Téléphone</TableHead>
                    <TableHead className="hidden lg:table-cell">Date de naissance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.user.idUser}>
                      <TableCell>{student.user.firstname}</TableCell>
                      <TableCell>{student.user.lastname}</TableCell>
                      <TableCell className="hidden lg:table-cell">{student.user.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{student.user.phone || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{student.dateOfBirth}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            Modifier
                          </button>
                          <button className="text-red-600 hover:underline text-sm">
                            Supprimer
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {students.map((student) => (
                <div
                  key={student.user.idUser}
                  className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm border dark:border-neutral-800"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {student.user.firstname} {student.user.lastname}
                      </h3>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        ✏️
                      </button>
                      <button className="text-red-600 hover:underline text-sm">
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center text-gray-600">
                      <span className="font-medium w-full sm:w-24">Email:</span>
                      <span className="break-all">{student.user.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Téléphone:</span>
                      <span>{student.user.phone || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Naissance:</span>
                      <span>{student.dateOfBirth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">
            Aucun élève inscrit pour cette classe.
          </p>
        )}
      </div>

      {/* Modal Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto backdrop-blur-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ajouter un élève</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userFields.map(({ label, field }) => (
                <div key={field} className={field === 'email' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <Input
                    type={field === 'password' ? 'password' : 'text'}
                    value={userForm.user[field] as string}
                    onChange={(e) => handleChange(e, field, 'user')}
                    required={[
                      'firstname',
                      'lastname',
                      'email',
                      'password',
                    ].includes(field)}
                    className="text-sm sm:text-base"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
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
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mt-6 mb-4">Adresse</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    onChange={(e) =>
                      handleChange(e, field as keyof Address, 'address')
                    }
                    className="text-sm sm:text-base"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6 pt-4">
              <Button type="submit" className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg w-full sm:w-auto">
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
