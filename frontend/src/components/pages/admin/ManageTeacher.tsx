import React, { useState, useEffect, useContext } from 'react';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { TeacherFormData, Teacher, Classes } from '../../../types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type SelectChangeEvent = {
  target: {
    name: string;
    value: string;
  };
};

type CheckboxChangeEvent = {
  target: {
    name: string;
    type: 'checkbox';
    checked: boolean | undefined;
  };
};

const ManageTeacher: React.FC = () => {
  const { teachers, fetchTeachers, createTeacher, deleteTeacher } =
    useContext(TeacherContext);
  const { classes, fetchClasses } = useContext(ClassesContext);

  const emptyForm: TeacherFormData = {
    user: {
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      phone: '',
      civility: 'M',
      role: 'TEACHER',
      idUser: 0,
      address: {
        street: '',
        number: '',
        box: '',
        postalCode: '',
        commune: '',
        country: '',
      },
    },
    contractType: 'CDI',
    isFullTime: true,
    availability: '',
    specialities: '',
  };

  const [formData, setFormData] = useState<TeacherFormData>(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | SelectChangeEvent
      | CheckboxChangeEvent,
  ) => {
    const { name } = e.target;

    // Pour SelectChangeEvent et CheckboxChangeEvent, on doit gérer le type
    if ('checked' in e.target && e.target.type === 'checkbox') {
      // Checkbox
      const checked = e.target.checked ?? false;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    const value = 'value' in e.target ? e.target.value : '';

    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          address: {
            ...prev.user.address,
            [key]: value,
          },
        },
      }));
    } else if (
      [
        'firstname',
        'lastname',
        'email',
        'phone',
        'civility',
        'password',
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    } else if (name === 'classId') {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          classEntity:
            classes?.find((c) => String(c.idClass) === value) ||
            ({} as Classes),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const openModalFor = (teacher?: Teacher) => {
    if (teacher) {
      setEditing(teacher);
      setFormData({
        user: {
          email: teacher.user.email,
          password: '',
          firstname: teacher.user.firstname,
          lastname: teacher.user.lastname,
          phone: teacher.user.phone,
          civility: teacher.user.civility,
          role: 'TEACHER',
          idUser: teacher.user.idUser,
          address: teacher.user.address,
        },
        contractType: teacher.contractType,
        isFullTime: teacher.isfullTime,
        availability: teacher.availability,
        specialities: teacher.specialities,
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      // await updateTeacher(editing.idTeacher, formData);
    } else {
      await createTeacher(formData);
    }
    setShowModal(false);
    fetchTeachers();
  };

  return (
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des enseignants
          </h1>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-lg"
        >
          + Nouvel(le) enseignant(e)
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {teachers ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Contrat</TableHead>
                <TableHead>FT</TableHead>
                <TableHead>Disp.</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {teachers.map((t) => (
                <TableRow
                  key={t.idTeacher}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell className="font-medium">
                    {t.user.lastname} {t.user.firstname}
                  </TableCell>
                  <TableCell>{t.user.email}</TableCell>
                  <TableCell>{t.specialities}</TableCell>
                  <TableCell>{t.contractType}</TableCell>
                  <TableCell>{t.isfullTime ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>{t.availability}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0071e3] hover:bg-[#0071e3]/10"
                      onClick={() => openModalFor(t)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-600/10"
                      onClick={() => deleteTeacher(t.idTeacher)}
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editing
                ? 'Modifier un enseignant'
                : 'Créer un nouvel enseignant'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations nécessaires pour{' '}
              {editing ? 'modifier' : 'créer'} cet enseignant
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">Prénom</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.user.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname">Nom de famille</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.user.lastname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.user.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {!editing && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.user.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.user.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="civility">Civilité</Label>
                <Select
                  name="civility"
                  value={formData.user.civility}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'civility', value },
                    } as SelectChangeEvent)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Civilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Monsieur</SelectItem>
                    <SelectItem value="Mme">Madame</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">Type de contrat</Label>
                <Select
                  name="contractType"
                  value={formData.contractType}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'contractType', value },
                    } as SelectChangeEvent)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Interim">Intérim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isfullTime"
                  name="isfullTime"
                  checked={formData.isFullTime}
                  onCheckedChange={(checked) =>
                    handleChange({
                      target: {
                        name: 'isFullTime',
                        type: 'checkbox',
                        checked,
                      },
                    } as CheckboxChangeEvent)
                  }
                />
                <Label htmlFor="isfullTime">Temps plein</Label>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="availability">Disponibilité</Label>
                <Input
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="specialities">Spécialités</Label>
                <Input
                  id="specialities"
                  name="specialities"
                  value={formData.specialities}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Separator />

            <div className="text-right space-x-2">
              <Button type="submit">{editing ? 'Modifier' : 'Créer'}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTeacher;
