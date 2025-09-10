import { useState } from 'react';

type ToastProps = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    console.log(`Toast [${variant}]: ${title} - ${description}`);
    // Pour l'instant, on utilise console.log
    // Plus tard on peut implémenter un vrai système de toast
    setToasts((prev) => [...prev, { title, description, variant }]);

    // Nettoyer après 3 secondes
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return { toast, toasts };
};
