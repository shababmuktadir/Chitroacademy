// src/App.jsx
import React from 'react';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './app/routes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen font-montserrat bg-white dark:bg-[#121212] text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased selection:bg-[#7393B3] selection:text-white dark:selection:bg-amber-500 dark:selection:text-slate-950">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}