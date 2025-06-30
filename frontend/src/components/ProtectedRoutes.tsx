import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRoles,
}) => {
  const { authenticatedUser } = useContext(UserContext);

  if (!authenticatedUser) {
    return <Navigate to="/login" />;
  }

  if (!requiredRoles.includes(authenticatedUser.user.role)) {
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;
