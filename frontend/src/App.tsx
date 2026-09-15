import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { BoardPage } from './pages/BoardPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas Autenticadas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/board" element={<BoardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Ruta Protegida Sólo Administrador */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
