import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, StickyNote, Users, LogOut, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-50 text-sky-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Marca FIXLAT */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">FIXLAT</span>
              <span className="text-xs ml-1.5 text-sky-600 font-semibold uppercase tracking-wider">Portal</span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/board" className={navLinkClass}>
              <StickyNote className="w-4 h-4" />
              Tablero de Notas
            </NavLink>

            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>

            {isAdmin && (
              <NavLink to="/users" className={navLinkClass}>
                <Users className="w-4 h-4" />
                Gestión de Usuarios
              </NavLink>
            )}
          </nav>
        </div>

        {/* Perfil de Usuario y Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-800">{user?.name}</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isAdmin ? 'Administrador' : 'Usuario'}
              </span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
