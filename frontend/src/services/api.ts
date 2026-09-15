import { AuthResponse, DashboardMetrics, Note, NoteStatus, Role, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Si la sesión expiró o el usuario fue desactivado, limpiar credenciales y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=1';
    }
    throw new ApiError(401, 'Sesión expirada o cuenta inactiva');
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}

export const api = {
  // Autenticación
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () => request<User>('/auth/me'),
  },

  // Gestión de Usuarios (Sólo Administrador)
  users: {
    getAll: () => request<User[]>('/users'),
    getById: (id: number) => request<User>(`/users/${id}`),
    create: (data: { name: string; email: string; password: string; role: Role; active?: boolean }) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name: string; email: string; role: Role; active: boolean; password?: string }) =>
      request<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id: number) =>
      request<User>(`/users/${id}/toggle-status`, {
        method: 'PATCH',
      }),
  },

  // Tablero de Notas Compartido
  notes: {
    getAll: () => request<Note[]>('/notes'),
    create: (data: { title: string; content?: string; status?: NoteStatus; posX?: number; posY?: number; color?: string }) =>
      request<Note>('/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { title: string; content: string; status: NoteStatus; color?: string }) =>
      request<Note>(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePosition: (id: number, posX: number, posY: number) =>
      request<Note>(`/notes/${id}/position`, {
        method: 'PATCH',
        body: JSON.stringify({ posX, posY }),
      }),
    delete: (id: number) =>
      request<void>(`/notes/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard de Métricas (Calculado con AWS Lambda)
  dashboard: {
    getMetrics: () => request<DashboardMetrics>('/dashboard/metrics'),
  },
};
