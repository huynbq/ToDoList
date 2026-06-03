// Move to separate file for fix eslint react-refresh/only-export-components rule
import { useContext } from 'react';
import { AuthContext } from './authCtx';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
