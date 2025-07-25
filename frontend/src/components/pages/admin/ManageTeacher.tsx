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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Gestion des enseignants
          </h1>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm sm:text-base lg:text-lg self-start sm:self-auto"
        >
          <span className="text-lg">+</span>
          <span className="hidden sm:inline">Nouvel(le) enseignant(e)</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {teachers ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Nom</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                    Email
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                    Spécialité
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                    Contrat
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                    FT
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden xl:table-cell">
                    Disp.
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {teachers.map((t) => (
                  <TableRow
                    key={t.idTeacher}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900"
                  >
                    <TableCell className="font-medium text-xs sm:text-sm">
                      <div>
                        <div>
                          {t.user.lastname} {t.user.firstname}
                        </div>
                        <div className="text-xs text-gray-500 md:hidden">
                          {t.user.email}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {t.contractType} • {t.isfullTime ? 'TP' : 'TC'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell truncate max-w-32">
                      {t.user.email}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell truncate max-w-24">
                      {t.specialities}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                      {t.contractType}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      {t.isfullTime ? 'Oui' : 'Non'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden xl:table-cell truncate max-w-20">
                      {t.availability}
                    </TableCell>
                    <TableCell className="space-x-1 sm:space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0071e3] hover:bg-[#0071e3]/10 dark:hover:bg-neutral-900 text-xs h-8 px-2 sm:px-3"
                        onClick={() => openModalFor(t)}
                      >
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">✏️</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-600/10 dark:hover:bg-neutral-900 text-xs h-8 px-2 sm:px-3"
                        onClick={() => deleteTeacher(t.idTeacher)}
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
            <p className="text-sm sm:text-base text-gray-500">
              Aucun enseignant disponible.
            </p>
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl mx-2 sm:mx-auto max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              {editing
                ? 'Modifier un enseignant'
                : 'Créer un nouvel enseignant'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Remplissez les informations nécessaires pour{' '}
              {editing ? 'modifier' : 'créer'} cet enseignant
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-sm">
                  Prénom
                </Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.user.firstname}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-sm">
                  Nom de famille
                </Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.user.lastname}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.user.email}
                  onChange={handleChange}
                  className="text-sm"
                  required
                />
              </div>

              {!editing && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.user.password}
                    onChange={handleChange}
                    className="text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.user.phone}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="civility" className="text-sm">
                  Civilité
                </Label>
                <Select
                  name="civility"
                  value={formData.user.civility}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'civility', value },
                    } as SelectChangeEvent)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Civilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M" className="text-sm">
                      Monsieur
                    </SelectItem>
                    <SelectItem value="Mme" className="text-sm">
                      Madame
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType" className="text-sm">
                  Type de contrat
                </Label>
                <Select
                  name="contractType"
                  value={formData.contractType}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'contractType', value },
                    } as SelectChangeEvent)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI" className="text-sm">
                      CDI
                    </SelectItem>
                    <SelectItem value="CDD" className="text-sm">
                      CDD
                    </SelectItem>
                    <SelectItem value="Interim" className="text-sm">
                      Intérim
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 sm:col-span-2">
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
                <Label htmlFor="isfullTime" className="text-sm">
                  Temps plein
                </Label>
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="availability" className="text-sm">
                  Disponibilité
                </Label>
                <Input
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="specialities" className="text-sm">
                  Spécialités
                </Label>
                <Input
                  id="specialities"
                  name="specialities"
                  value={formData.specialities}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end sm:space-x-2 pt-2">
              <Button type="submit" className="text-sm">
                {editing ? 'Modifier' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="text-sm"
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
