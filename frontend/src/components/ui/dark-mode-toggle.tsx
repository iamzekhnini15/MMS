import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  asIcon?: boolean; // Nouveau prop pour rendre juste l'icône sans bouton
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  className = '',
  size = 'default',
  asIcon = false,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Si asIcon est true, retourner juste l'icône sans bouton
  if (asIcon) {
    return (
      <div
        onClick={toggleDarkMode}
        className={`cursor-pointer ${className}`}
        aria-label={
          isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'
        }
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-neutral-900 ${className}`}
      aria-label={
        isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'
      }
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
