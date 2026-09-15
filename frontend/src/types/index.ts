export type Role = 'ADMIN' | 'USER';

export type NoteStatus = 'PENDIENTE' | 'EN_CURSO' | 'HECHO';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  status: NoteStatus;
  posX: number;
  posY: number;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  totalNotes: number;
  byStatus: {
    PENDIENTE: number;
    EN_CURSO: number;
    HECHO: number;
  };
  source: string;
  timestamp: string;
}
