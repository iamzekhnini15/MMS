import React from 'react';
import { X } from 'lucide-react';

interface ValidationErrorDisplayProps {
  errors: string[];
  onClose: () => void;
}

const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-red-600">
            Conflits détectés
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Les conflits suivants empêchent la création de l'emploi du temps :
          </p>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-sm text-gray-800">{error}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationErrorDisplay;
