import React, { useEffect, useContext, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { StudentContext } from '../../../contexts/StudentContext';
import type { Classes, Student } from '../../../types';

interface StudentsListModalProps {
  classData: Classes;
  isOpen: boolean;
  onClose: () => void;
}

const StudentsListModal: React.FC<StudentsListModalProps> = ({
  classData,
  isOpen,
  onClose,
}) => {
  const { students, loading, error, getAllStudentsForClass } = useContext(StudentContext);
  const [localStudents, setLocalStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (isOpen && classData.idClass) {
      getAllStudentsForClass(classData.idClass);
    }
  }, [isOpen, classData.idClass, getAllStudentsForClass]);

  useEffect(() => {
    if (students) {
      setLocalStudents(students);
    }
  }, [students]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Étudiants de la classe {classData.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {localStudents.length} étudiant{localStudents.length !== 1 ? 's' : ''} inscrit{localStudents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            Fermer
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement des étudiants...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Erreur: {error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && localStudents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Aucun étudiant trouvé</p>
                <p className="text-gray-400">
                  Cette classe ne contient pas encore d'étudiants inscrits.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && localStudents.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {localStudents.map((student: Student) => (
                <Card key={student.idStudent} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {student.user.firstname} {student.user.lastname}
                        </h3>
                        
                        <div className="mt-2 space-y-1">
                          {student.user.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span className="truncate">{student.user.email}</span>
                            </div>
                          )}
                          
                          {student.dateOfBirth && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarDaysIcon className="w-4 h-4" />
                              <span>
                                {new Date(student.dateOfBirth).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <Badge variant="secondary" className="text-xs">
                            ID: {student.idStudent}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>{localStudents.length}</strong> étudiant{localStudents.length !== 1 ? 's' : ''} au total
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsListModal;
