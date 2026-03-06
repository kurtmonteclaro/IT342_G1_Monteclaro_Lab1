import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';

export function ProtectedRoute({ children, requiredRole }) {
  const auth = useContext(AuthContext);

  if (auth.loading) {
    return (
      <div className="page-loader">
        <div className="page-loader__orb" />
        <p>Loading VetEase...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
