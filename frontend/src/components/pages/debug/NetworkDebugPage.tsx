import { useEffect, useState } from 'react';

interface APITest {
  endpoint: string;
  status: 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
}

const NetworkDebugPage = () => {
  const [tests, setTests] = useState<APITest[]>([
    { endpoint: '/api/bulletin-periods/all', status: 'testing' },
    { endpoint: '/api/bulletin-periods/active', status: 'testing' },
    { endpoint: '/api/bulletin-periods/current', status: 'testing' },
    { endpoint: '/api/classes/getAll', status: 'testing' },
    { endpoint: '/api/subject/getAll', status: 'testing' },
    { endpoint: '/api/students/class/1', status: 'testing' },
  ]);

  useEffect(() => {
    const testAPI = async (endpoint: string, index: number) => {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        setTests(prev => prev.map((test, i) => 
          i === index 
            ? { 
                ...test, 
                status: response.ok ? 'success' : 'error',
                response: data,
                error: response.ok ? undefined : `${response.status} ${response.statusText}`
              }
            : test
        ));
      } catch (error) {
        setTests(prev => prev.map((test, i) => 
          i === index 
            ? { 
                ...test, 
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : test
        ));
      }
    };

    tests.forEach((test, index) => {
      testAPI(test.endpoint, index);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Network Debug Page</h1>
      
      <div className="space-y-4">
        {tests.map((test) => (
          <div 
            key={test.endpoint}
            className={`p-4 border rounded-lg ${
              test.status === 'success' ? 'border-green-500 bg-green-50' :
              test.status === 'error' ? 'border-red-500 bg-red-50' :
              'border-yellow-500 bg-yellow-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <code className="font-mono text-sm">{test.endpoint}</code>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                test.status === 'success' ? 'bg-green-200 text-green-800' :
                test.status === 'error' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {test.status}
              </span>
            </div>
            
            {test.error && (
              <div className="text-red-600 text-sm mb-2">
                Error: {test.error}
              </div>
            )}
            
            {test.response && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">Response</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(test.response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkDebugPage;
