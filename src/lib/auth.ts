import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { AuthUser, LoginCredentials, RegisterData } from '@/types/auth'

// Simulación de base de datos en memoria (para desarrollo)
const users: Array<{
  id: string
  email: string
  password: string
  fullName: string
  role: 'admin' | 'coach' | 'athlete'
  createdAt: string
  updatedAt: string
}> = [
  {
    id: '1',
    email: 'admin@clubes.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    fullName: 'Administrador del Sistema',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'coach@clubes.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    fullName: 'Entrenador Principal',
    role: 'coach',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'athlete@clubes.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    fullName: 'Deportista Ejemplo',
    role: 'athlete',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      const user = users.find(u => u.email === credentials.email)
      
      if (!user) {
        return { user: null, error: 'Credenciales inválidas' }
      }

      const isValidPassword = await bcrypt.compare(credentials.password, user.password)
      
      if (!isValidPassword) {
        return { user: null, error: 'Credenciales inválidas' }
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }

      return { user: authUser }
    } catch (error) {
      console.error('Error en login:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  static async register(data: RegisterData): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      // Verificar si el email ya existe
      const existingUser = users.find(u => u.email === data.email)
      if (existingUser) {
        return { user: null, error: 'El email ya está registrado' }
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Crear nuevo usuario
      const newUser = {
        id: (users.length + 1).toString(),
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      users.push(newUser)

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      }

      return { user: authUser }
    } catch (error) {
      console.error('Error en registro:', error)
      return { user: null, error: 'Error interno del servidor' }
    }
  }

  static generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        id: decoded.id,
        email: decoded.email,
        fullName: '', // No se almacena en el token
        role: decoded.role,
      }
    } catch (error) {
      return null
    }
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    const user = users.find(u => u.id === id)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    }
  }
}
