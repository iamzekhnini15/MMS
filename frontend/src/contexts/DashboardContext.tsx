import { createContext, useState, ReactNode, useEffect } from 'react';
import { KpiContextType, KpiData } from '../types';

const defaultKpiContext: KpiContextType = {
  kpis: null,
  loading: true,
  error: null,
  refreshKpis: async () => {},
};

const KpiContext = createContext<KpiContextType>(defaultKpiContext);

const KpiContextProvider = ({ children }: { children: ReactNode }) => {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/kpis');

      console.log('Réponse brute', response);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const data: KpiData = await response.json();
      console.log('Données reçues', data);

      setKpis(data);
      setError(null);
    } catch (err) {
      console.error('fetchKpis::error:', err);
      setError('Erreur lors du chargement des KPI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const myContext: KpiContextType = {
    kpis,
    loading,
    error,
    refreshKpis: fetchKpis,
  };

  return (
    <KpiContext.Provider value={myContext}>{children}</KpiContext.Provider>
  );
};

export { KpiContext, KpiContextProvider };
