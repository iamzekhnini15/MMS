import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useRoleBasedRedirect } from '../../hooks/useRoleBasedRedirect';

/**
 * Composant qui redirige automatiquement vers le dashboard approprié 
 * en fonction du rôle de l'utilisateur connecté
 */
export function RoleBasedDashboardRedirect() {
  const { authenticatedUser } = useContext(UserContext);
  const { redirectBasedOnRole } = useRoleBasedRedirect();

  useEffect(() => {
    if (authenticatedUser) {
      redirectBasedOnRole(authenticatedUser);
    }
  }, [authenticatedUser, redirectBasedOnRole]);

  // Affichage d'un loader pendant la redirection
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
