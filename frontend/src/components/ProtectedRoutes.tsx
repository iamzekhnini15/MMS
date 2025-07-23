import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useRoleBasedRedirect } from '../hooks/useRoleBasedRedirect';

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRoles,
}) => {
  const { authenticatedUser } = useContext(UserContext);
  const { getDefaultRouteForRole } = useRoleBasedRedirect();

  if (!authenticatedUser) {
    return <Navigate to="/login" />;
  }

  if (!requiredRoles.includes(authenticatedUser.user.role)) {
    // Rediriger vers le dashboard approprié pour le rôle de l'utilisateur
    const defaultRoute = getDefaultRouteForRole(authenticatedUser.user.role);
    return <Navigate to={defaultRoute} />;
  }

  return element;
};

export default ProtectedRoute;
