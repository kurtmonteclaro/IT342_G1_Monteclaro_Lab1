import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function ProtectedRoute({ children, requiredRole }) {
  const auth = useContext(AuthContext);

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
