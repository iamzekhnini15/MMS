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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Gestion des cours
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Créez, modifiez et suivez les matières enseignées
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg w-full sm:w-auto"
        >
          + Nouveau cours
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {courses ? (
          <>
            {/* Table Desktop/Tablet */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-neutral-800">
                    <TableHead className="text-gray-900 dark:text-white">
                      Nom du cours
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-gray-900 dark:text-white">
                      Salle de cours
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-gray-900 dark:text-white">
                      Date de début
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-gray-900 dark:text-white">
                      Date de fin
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      Enseignant
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {courses.map((course) => (
                    <TableRow
                      key={course.idCourse}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900 border-gray-200 dark:border-neutral-800"
                      onClick={() =>
                        navigate(`/manage-courses/${course.idCourse}`)
                      }
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {course.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-300">
                        {course.classroom.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-300">
                        {course.startDateTime}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-300">
                        {course.endDateTime}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        <div className="lg:hidden">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {course.teacher.user.firstname}{' '}
                            {course.teacher.user.lastname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Salle: {course.classroom.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {course.startDateTime} - {course.endDateTime}
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          {course.teacher.user.firstname}{' '}
                          {course.teacher.user.lastname}
                        </div>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#0071e3] hover:bg-[#0071e3]/10 dark:text-gray-300 dark:hover:bg-neutral-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course.idCourse);
                          }}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {courses.map((course) => (
                <div
                  key={course.idCourse}
                  className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/manage-courses/${course.idCourse}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1">
                      {course.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(course.idCourse);
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="font-medium w-20">Enseignant:</span>
                      <span>
                        {course.teacher.user.firstname}{' '}
                        {course.teacher.user.lastname}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="font-medium w-20">Salle:</span>
                      <span>{course.classroom.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <span className="font-medium w-20">Période:</span>
                      <span>
                        {course.startDateTime} - {course.endDateTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucun cours disponible.
          </p>
        )}
      </div>

      {/* Modal création/modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto border dark:border-neutral-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                Nouveau cours
              </h2>
              <button
                style={{ cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                aria-label="Fermer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
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
                  className="w-full border border-gray-300 dark:border-neutral-800 rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label
                  className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
                  htmlFor="classroomId"
                >
                  Salle de cours
                </label>
                <select
                  name="classroomId"
                  id="classroomId"
                  value={form.classroom.idClassroom || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-neutral-800 rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                >
                  <option value="">-- Choisir une salle --</option>
                  {classrooms?.map((c) => (
                    <option key={c.idClassroom} value={c.idClassroom}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
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
                    className="w-full border border-gray-300 dark:border-neutral-800 rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
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
                    className="w-full border border-gray-300 dark:border-neutral-800 rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
                  htmlFor="teacherId"
                >
                  Enseignant
                </label>
                <select
                  name="teacherId"
                  id="teacherId"
                  value={form.teacher.idTeacher || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-neutral-800 rounded-lg p-2 text-sm sm:text-base bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
                >
                  <option value="">-- Choisir un enseignant --</option>
                  {teachers?.map((t) => (
                    <option key={t.idTeacher} value={t.idTeacher}>
                      {t.user.lastname} {t.user.firstname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 dark:bg-neutral-900 hover:bg-gray-400 dark:hover:bg-neutral-900 text-gray-900 dark:text-white text-sm sm:text-base order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 dark:bg-neutral-900 text-white hover:bg-blue-700 dark:hover:bg-neutral-900 text-sm sm:text-base order-1 sm:order-2"
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
