import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import RegisterPage from '@/app/auth/register/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('RegisterPage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders register form', () => {
    render(<RegisterPage />)
    
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Rol')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument()
  })

  it('has correct role options', () => {
    render(<RegisterPage />)
    
    const roleSelect = screen.getByLabelText('Rol')
    expect(roleSelect).toBeInTheDocument()
    
    const options = Array.from(roleSelect.querySelectorAll('option')).map(option => option.value)
    expect(options).toEqual(['athlete', 'coach', 'admin'])
  })

  it('handles form submission successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'newuser@example.com',
      fullName: 'New User',
      role: 'athlete',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response)

    render(<RegisterPage />)
    
    const fullNameInput = screen.getByLabelText('Nombre Completo')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const roleSelect = screen.getByLabelText('Rol')
    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' })

    fireEvent.change(fullNameInput, { target: { value: 'New User' } })
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(roleSelect, { target: { value: 'athlete' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          fullName: 'New User',
          role: 'athlete',
        }),
      })
    })
  })

  it('shows error message on failed registration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'El email ya está registrado' }),
    } as Response)

    render(<RegisterPage />)
    
    const fullNameInput = screen.getByLabelText('Nombre Completo')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' })

    fireEvent.change(fullNameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ user: { id: '1', email: 'test@example.com', fullName: 'Test', role: 'athlete' } }),
      } as Response), 100))
    )

    render(<RegisterPage />)
    
    const fullNameInput = screen.getByLabelText('Nombre Completo')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Contraseña')
    const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' })

    fireEvent.change(fullNameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Creando cuenta...')).toBeInTheDocument()
  })
})
