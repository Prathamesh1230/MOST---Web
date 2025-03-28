import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    return !!user;
  };

  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;