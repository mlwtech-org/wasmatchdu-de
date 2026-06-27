import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profiles, activeProfileId } = usePlayerStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but has no profiles, force them to create one
  if (profiles.length === 0) {
    return <Navigate to="/create-profile" replace />;
  }

  // If user has profiles but hasn't selected one, show profile selection
  if (!activeProfileId) {
    return <Navigate to="/profile-selection" replace />;
  }

  return <>{children}</>;
};
