import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = usePlayerStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
