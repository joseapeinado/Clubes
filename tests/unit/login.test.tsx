import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('LoginPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument()
  })

  it('shows test credentials', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Credenciales de prueba:')).toBeInTheDocument()
    expect(screen.getByText(/Admin: admin@clubes.com \/ password/)).toBeInTheDocument()
    expect(screen.getByText(/Entrenador: coach@clubes.com \/ password/)).toBeInTheDocument()
    expect(screen.getByText(/Deportista: athlete@clubes.com \/ password/)).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'admin@clubes.com',
      fullName: 'Administrador',
      role: 'admin',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response)

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    fireEvent.change(emailInput, { target: { value: 'admin@clubes.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@clubes.com',
          password: 'password',
        }),
      })
    })
  })

  it('shows error message on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Credenciales inválidas' }),
    } as Response)

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ user: { id: '1', email: 'test@example.com', fullName: 'Test', role: 'admin' } }),
      } as Response), 100))
    )

    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' })

    fireEvent.change(emailInput, { target: { value: 'admin@clubes.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument()
  })
})
