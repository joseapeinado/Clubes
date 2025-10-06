import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { RegisterData } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const data: RegisterData = await request.json()

    // Validar datos de entrada
    if (!data.email || !data.password || !data.fullName || !data.role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar contraseña
    if (data.password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar rol
    if (!['admin', 'coach', 'athlete'].includes(data.role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    const result = await AuthService.register(data)

    if (!result.user) {
      return NextResponse.json(
        { error: result.error || 'Error en el registro' },
        { status: 400 }
      )
    }

    // Generar token JWT
    const token = AuthService.generateToken(result.user)

    // Crear respuesta con cookie
    const response = NextResponse.json({
      user: result.user,
      message: 'Registro exitoso'
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
    console.error('Error en API de registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}