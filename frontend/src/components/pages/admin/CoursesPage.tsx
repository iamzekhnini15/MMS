import React, { useContext, useState } from 'react';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import { Classroom, Course, Teacher } from '../../../types';
import { Button } from '../../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { useNavigate } from 'react-router-dom';

const Courses: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { courses, loading, error, deleteCourses, createCourse } =
    useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);
  const navigate = useNavigate();

  const [form, setForm] = useState<Course>({
    idCourse: 0,
    classroom: {} as Classroom,
    teacher: {} as Teacher,
    startDateTime: '',
    endDateTime: '',
    name: '',
  });

  if (loading) return <p className="p-6">Chargement des cours...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'classroomId') {
      const classroom = classrooms?.find(
        (c) => c.idClassroom === Number(value),
      );
      if (classroom) setForm({ ...form, classroom });
    } else if (name === 'teacherId') {
      const teacher = teachers?.find((t) => t.idTeacher === Number(value));
      if (teacher) setForm({ ...form, teacher });
    } else if (name === 'name') {
      setForm({ ...form, name: value });
    } else if (name === 'startDateTime') {
      setForm({ ...form, startDateTime: value });
    } else if (name === 'endDateTime') {
      setForm({ ...form, endDateTime: value });
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Supprimer ce cours ?');
    if (confirmed) {
      await deleteCourses(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      alert('Veuillez renseigner le nom du cours');
      return;
    }
    if (!form.classroom.idClassroom) {
      alert('Veuillez choisir une salle de cours');
      return;
    }
    if (!form.teacher.idTeacher) {
      alert('Veuillez choisir un enseignant');
      return;
    }

    const newCourse: Course = {
      idCourse: form.idCourse || 0,
      classroom: form.classroom,
      teacher: form.teacher,
      startDateTime: form.startDateTime,
      endDateTime: form.endDateTime,
      name: form.name,
    };

    console.log('Formulaire soumis', newCourse);
    await createCourse(newCourse);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-8 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-start max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des cours
          </h1>
          <p className="text-gray-600">
            Créez, modifiez et suivez les matières enseignées
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-lg"
        >
          + Nouveau cours
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {courses ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du cours</TableHead>
                <TableHead>Salle de cours</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead>Date de fin</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {courses.map((course) => (
                <TableRow
                  key={course.idCourse}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/manage-courses/${course.idCourse}`)}
                >
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.classroom.name}</TableCell>
                  <TableCell>{course.startDateTime}</TableCell>
                  <TableCell>{course.endDateTime}</TableCell>
                  <TableCell>
                    {course.teacher.user.firstname}{' '}
                    {course.teacher.user.lastname}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0071e3] hover:bg-[#0071e3]/10"
                      onClick={() => handleDelete(course.idCourse)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">Aucun cours disponible.</p>
        )}
      </div>

      {/* Modal création/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Nouveau cours
              </h2>
              <button
                style={{ cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="name"
                >
                  Nom du cours
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Mathématiques"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="classroomId"
                >
                  Salle de cours
                </label>
                <select
                  name="classroomId"
                  id="classroomId"
                  value={form.classroom.idClassroom || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">-- Choisir une salle --</option>
                  {classrooms?.map((c) => (
                    <option key={c.idClassroom} value={c.idClassroom}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm text-gray-700 mb-1"
                    htmlFor="startDateTime"
                  >
                    Date de début
                  </label>
                  <input
                    type="date"
                    name="startDateTime"
                    id="startDateTime"
                    value={form.startDateTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm text-gray-700 mb-1"
                    htmlFor="endDateTime"
                  >
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="endDateTime"
                    id="endDateTime"
                    value={form.endDateTime}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="teacherId"
                >
                  Enseignant
                </label>
                <select
                  name="teacherId"
                  id="teacherId"
                  value={form.teacher.idTeacher || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">-- Choisir un enseignant --</option>
                  {teachers?.map((t) => (
                    <option key={t.idTeacher} value={t.idTeacher}>
                      {t.user.lastname} {t.user.firstname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
