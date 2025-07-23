import { useNavigate } from 'react-router-dom';
import { AuthenticatedUser } from '../types';

export const useRoleBasedRedirect = () => {
  const navigate = useNavigate();

  const redirectBasedOnRole = (user: AuthenticatedUser) => {
    const role = user.user.role;
    
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'TEACHER':
        navigate('/teacher/dashboard');
        break;
      case 'STUDENT':
        navigate('/student');
        break;
      default:
        navigate('/dashboard'); // Fallback par défaut
    }
  };

  const getDefaultRouteForRole = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student';
      default:
        return '/dashboard';
    }
  };

  return {
    redirectBasedOnRole,
    getDefaultRouteForRole,
  };
};
