import { createContext, useState, ReactNode } from 'react';
import { BulletinPeriod, BulletinPeriodContextType } from '../types';

const defaultBulletinPeriodContext: BulletinPeriodContextType = {
  periods: null,
  currentPeriod: null,
  loading: false,
  error: null,
  fetchActivePeriods: async () => {},
  fetchCurrentPeriod: async () => {},
  createPeriod: async () => {},
  updatePeriod: async () => {},
  deletePeriod: async () => {},
};

const BulletinPeriodContext = createContext<BulletinPeriodContextType>(
  defaultBulletinPeriodContext,
);

export const BulletinPeriodProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [periods, setPeriods] = useState<BulletinPeriod[] | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<BulletinPeriod | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulletin-periods/active');
      if (!response.ok) {
        throw new Error('Failed to fetch periods');
      }
      const data = await response.json();
      setPeriods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPeriod = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulletin-periods/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentPeriod(data);
      } else {
        setCurrentPeriod(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createPeriod = async (period: BulletinPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulletin-periods/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(period),
      });

      if (!response.ok) {
        throw new Error('Failed to create period');
      }

      await fetchActivePeriods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updatePeriod = async (id: number, period: BulletinPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletin-periods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(period),
      });

      if (!response.ok) {
        throw new Error('Failed to update period');
      }

      await fetchActivePeriods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const deletePeriod = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bulletin-periods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete period');
      }

      await fetchActivePeriods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const value: BulletinPeriodContextType = {
    periods,
    currentPeriod,
    loading,
    error,
    fetchActivePeriods,
    fetchCurrentPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod,
  };

  return (
    <BulletinPeriodContext.Provider value={value}>
      {children}
    </BulletinPeriodContext.Provider>
  );
};

export default BulletinPeriodContext;
