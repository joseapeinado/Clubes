export interface User {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'coach' | 'athlete'
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'coach' | 'athlete'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  role: 'admin' | 'coach' | 'athlete'
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}
