import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormMessageProps {
  type: 'error' | 'success' | 'warning';
  message: string;
}

const FormMessage = ({ type, message }: FormMessageProps) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-lg border ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default FormMessage;
