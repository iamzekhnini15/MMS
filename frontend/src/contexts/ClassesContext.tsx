import { createContext, useEffect, useState, ReactNode } from 'react';
import { ClassesContextType, Classes } from '../types';

const defaultContext: ClassesContextType = {
  classes: null,
  loading: true,
  error: null,
  fetchClasses: async () => {},
  fetchAllClasses: async () => {},
  createClass: async () => {},
};

const ClassesContext = createContext<ClassesContextType>(defaultContext);

const ClassesProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Classes[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classes/getAll');
      if (!response.ok) throw new Error(`Erreur API ${response.statusText}`);
      const data = await response.json();
      console.log(data);
      setClasses(data);
      setError(null);
    } catch (err) {
      console.error('fetchClasses::error', err);
      setError('Erreur lors du chargement des classes.');
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (newClass: Omit<Classes, 'idClass'>) => {
    try {
      setLoading(true);
      console.log(newClass);
      const response = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Erreur lors de la création de la classe.',
        );
      }

      // Option 1: recharger la liste complète après création
      await fetchClasses();

      // Option 2 (alternatif) : récupérer la classe créée et l'ajouter localement
      // const createdClass = await response.json();
      // setClasses(prev => prev ? [...prev, createdClass] : [createdClass]);

      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('createClass::error', err);
        setError(err.message || 'Erreur lors de la création de la classe.');
      } else {
        console.error('createClass::error', err);
        setError('Erreur inconnue lors de la création de la classe.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Alias for fetchClasses to match the interface
  const fetchAllClasses = fetchClasses;

  useEffect(() => {
    fetchClasses();
  }, []);

  const myContext: ClassesContextType = {
    fetchClasses,
    fetchAllClasses,
    createClass,
    classes,
    loading,
    error,
  };

  return (
    <ClassesContext.Provider value={myContext}>
      {children}
    </ClassesContext.Provider>
  );
};

export { ClassesContext, ClassesProvider };
