import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0F6A4B 0%, #1a8a60 100%)',
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-4"
          />
          <p className="text-white font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
