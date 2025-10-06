import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Plataforma de Clubes Deportivos')
  })

  it('renders the description', () => {
    render(<HomePage />)
    
    const description = screen.getByText('Sistema de gestión integral para clubes deportivos')
    expect(description).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<HomePage />)
    
    const welcome = screen.getByText('¡Bienvenido!')
    expect(welcome).toBeInTheDocument()
  })

  it('renders the feature list', () => {
    render(<HomePage />)
    
    expect(screen.getByText('• Gestionar disciplinas deportivas')).toBeInTheDocument()
    expect(screen.getByText('• Administrar deportistas y entrenadores')).toBeInTheDocument()
    expect(screen.getByText('• Controlar cuotas sociales')).toBeInTheDocument()
    expect(screen.getByText('• Acceder con diferentes roles de usuario')).toBeInTheDocument()
  })

  it('renders the iteration status', () => {
    render(<HomePage />)
    
    const status = screen.getByText('🚀 Iteración 1: Fundación Básica - Completada')
    expect(status).toBeInTheDocument()
  })
})
