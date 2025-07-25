import { createContext, useState, ReactNode, useCallback } from 'react';
import { BulletinPeriod, BulletinPeriodContextType } from '../types';

const defaultBulletinPeriodContext: BulletinPeriodContextType = {
  periods: null,
  currentPeriod: null,
  loading: false,
  error: null,
  fetchActivePeriods: async () => {},
  fetchAllPeriods: async () => {},
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

  const fetchAllPeriods = useCallback(async () => {
    console.log('fetchAllPeriods called');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulletin-periods/all');
      console.log('fetchAllPeriods response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch all periods');
      }
      const data = await response.json();
      console.log('fetchAllPeriods data:', data);
      setPeriods(data);
    } catch (err) {
      console.error('fetchAllPeriods error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivePeriods = useCallback(async () => {
    console.log('fetchActivePeriods called');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bulletin-periods/active');
      console.log('fetchActivePeriods response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch periods');
      }
      const data = await response.json();
      console.log('fetchActivePeriods data:', data);
      setPeriods(data);

      // Automatically set current period to the first active period if not already set
      if (data && data.length > 0 && !currentPeriod) {
        // Try to find the period marked as current, or use the first one
        const currentPeriodFromAPI =
          data.find((period: BulletinPeriod) => period.isActive) || data[0];
        setCurrentPeriod(currentPeriodFromAPI);
        console.log('Auto-selected current period:', currentPeriodFromAPI);
      }
    } catch (err) {
      console.error('fetchActivePeriods error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentPeriod]);

  const fetchCurrentPeriod = useCallback(async () => {
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
  }, []);

  const createPeriod = useCallback(
    async (period: BulletinPeriod) => {
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
    },
    [fetchActivePeriods],
  );

  const updatePeriod = useCallback(
    async (id: number, period: BulletinPeriod) => {
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
    },
    [fetchActivePeriods],
  );

  const deletePeriod = useCallback(
    async (id: number) => {
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
    },
    [fetchActivePeriods],
  );

  const value: BulletinPeriodContextType = {
    periods,
    currentPeriod,
    loading,
    error,
    fetchActivePeriods,
    fetchAllPeriods,
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
