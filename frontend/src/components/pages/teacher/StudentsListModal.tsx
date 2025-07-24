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
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Étudiants de la classe {classData.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {localStudents.length} étudiant{localStudents.length !== 1 ? 's' : ''} inscrit{localStudents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 text-white dark:text-white border-white dark:border-white hover:bg-white hover:text-gray-900 dark:hover:bg-white dark:hover:text-gray-900"
          >
            <XMarkIcon className="w-4 h-4" />
            Fermer
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Chargement des étudiants...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400">Erreur: {error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && localStudents.length === 0 && (
            <Card className="text-center py-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
              <CardContent>
                <AcademicCapIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucun étudiant trouvé</p>
                <p className="text-gray-400 dark:text-gray-500">
                  Cette classe ne contient pas encore d'étudiants inscrits.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && localStudents.length > 0 && (
            <div className="space-y-1">
              {/* Header de la liste */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-neutral-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-700">
                <div className="col-span-4">Nom complet</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Date de naissance</div>
                <div className="col-span-2">ID Étudiant</div>
              </div>
              
              {/* Liste des étudiants */}
              {localStudents.map((student: Student, index) => (
                <div 
                  key={student.idStudent} 
                  className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors border-b border-gray-100 dark:border-neutral-800 ${
                    index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-gray-25 dark:bg-neutral-900/50'
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {student.user.firstname} {student.user.lastname}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-span-4 flex items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {student.user.email || 'Non renseigné'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.dateOfBirth 
                          ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR')
                          : 'Non renseigné'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-700">
                      {student.idStudent}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-neutral-700 p-6 bg-gray-50 dark:bg-neutral-800">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <strong>{localStudents.length}</strong> étudiant{localStudents.length !== 1 ? 's' : ''} au total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsListModal;
