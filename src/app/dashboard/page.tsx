'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'coach':
        return 'Entrenador'
      case 'athlete':
        return 'Deportista'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'coach':
        return 'bg-blue-100 text-blue-800'
      case 'athlete':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Bienvenido, {user?.fullName}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || '')}`}>
                  {getRoleDisplayName(user?.role || '')}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-outline btn-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="card">
              <div className="card-content">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ¡Bienvenido a la Plataforma de Clubes Deportivos!
                </h2>
                <p className="text-gray-600 mb-6">
                  Esta es la versión con autenticación. Has iniciado sesión correctamente como {getRoleDisplayName(user?.role || '').toLowerCase()}.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <div className="card-content">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Perfil de Usuario
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Información de tu cuenta
                      </p>
                      <div className="space-y-2">
                        <p><strong>Nombre:</strong> {user?.fullName}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Rol:</strong> {getRoleDisplayName(user?.role || '')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-content">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Funcionalidades
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Próximamente disponibles
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Gestión de disciplinas</li>
                        <li>• Administración de deportistas</li>
                        <li>• Control de cuotas</li>
                        <li>• Reportes y estadísticas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-content">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Estado del Sistema
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Iteración 2 completada
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Autenticación Funcionando
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}