import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { LoginCredentials } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json()

    // Validar datos de entrada
    if (!credentials.email || !credentials.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const result = await AuthService.login(credentials)

    if (!result.user) {
      return NextResponse.json(
        { error: result.error || 'Error de autenticación' },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = AuthService.generateToken(result.user)

    // Crear respuesta con cookie
    const response = NextResponse.json({
      user: result.user,
      message: 'Login exitoso'
    })

    // Configurar cookie HTTP-only
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error en API de login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}