export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plataforma de Clubes Deportivos
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de gestión integral para clubes deportivos
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ¡Bienvenido!
            </h2>
            <p className="text-gray-600 mb-6">
              Esta es la versión inicial de la plataforma. Próximamente podrás:
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Gestionar disciplinas deportivas</li>
              <li>• Administrar deportistas y entrenadores</li>
              <li>• Controlar cuotas sociales</li>
              <li>• Acceder con diferentes roles de usuario</li>
            </ul>
            <div className="mt-8">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-lg">
                <span className="text-sm font-medium">
                  🚀 Iteración 1: Fundación Básica - Completada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
