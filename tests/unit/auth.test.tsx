import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginCredentials, RegisterData } from '@/types/auth'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Componente de prueba para el contexto
function TestComponent() {
  const { user, loading, login, register, logout } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>No user</div>
  
  return (
    <div>
      <div data-testid="user-name">{user.fullName}</div>
      <div data-testid="user-role">{user.role}</div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

function TestComponentWithAuth() {
  return (
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should show loading initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No autorizado' }),
    } as Response)

    render(<TestComponentWithAuth />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show no user when not authenticated', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No autorizado' }),
    } as Response)

    render(<TestComponentWithAuth />)
    
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })
  })

  it('should show user when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin' as const,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response)

    render(<TestComponentWithAuth />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin')
    })
  })

  it('should handle login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin' as const,
    }

    // Mock /api/auth/me call
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No autorizado' }),
    } as Response)

    // Mock /api/auth/login call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response)

    render(<TestComponentWithAuth />)
    
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin' as const,
    }

    // Mock /api/auth/me call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    } as Response)

    // Mock /api/auth/logout call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Logout exitoso' }),
    } as Response)

    render(<TestComponentWithAuth />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    })

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      })
    })
  })
})
