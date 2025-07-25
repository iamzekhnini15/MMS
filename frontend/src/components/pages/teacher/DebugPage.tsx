import React, { useEffect, useState, useContext } from 'react';
import { ClassesContext } from '../../../contexts/ClassesContext';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import { UserContext } from '../../../contexts/UserContext';

const DebugPage: React.FC = () => {
  const {
    classes,
    loading: classesLoading,
    error: classesError,
    fetchClasses,
  } = useContext(ClassesContext);
  const {
    periods,
    currentPeriod,
    loading: periodsLoading,
    error: periodsError,
    fetchActivePeriods,
  } = useContext(BulletinPeriodContext);
  const { authenticatedUser } = useContext(UserContext);

  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkAPI = async () => {
      try {
        console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('Testing URL:', '/api/classes/getAll');
        const response = await fetch('/api/classes/getAll');
        setApiStatus(`API Response: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log('Raw API Response:', text.substring(0, 200));
      } catch (err) {
        setApiStatus(`API Error: ${err}`);
      }
    };

    checkAPI();
    fetchClasses();
    fetchActivePeriods();
  }, [fetchClasses, fetchActivePeriods]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold">User Context</h2>
          <p>Authenticated: {authenticatedUser ? 'Yes' : 'No'}</p>
          <p>User ID: {authenticatedUser?.user?.idUser || 'N/A'}</p>
          <p>Role: {authenticatedUser?.user?.role || 'N/A'}</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-semibold">Classes Context</h2>
          <p>Loading: {classesLoading ? 'Yes' : 'No'}</p>
          <p>Error: {classesError || 'None'}</p>
          <p>Classes Count: {classes?.length || 0}</p>
          <p>API Status: {apiStatus}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-semibold">Periods Context</h2>
          <p>Loading: {periodsLoading ? 'Yes' : 'No'}</p>
          <p>Error: {periodsError || 'None'}</p>
          <p>Periods Count: {periods?.length || 0}</p>
          <p>Current Period: {currentPeriod?.name || 'None'}</p>
        </div>

        {classes && (
          <div className="bg-purple-50 p-4 rounded">
            <h2 className="font-semibold">Classes Data</h2>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(classes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage;
