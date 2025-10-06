#!/bin/bash

# Script para ejecutar tests e2e con Playwright
echo "🎭 Ejecutando tests e2e con Playwright..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose. Por favor, inicia Docker Desktop."
    exit 1
fi

# Verificar que el contenedor frontend esté ejecutándose
if ! docker-compose ps frontend | grep -q "Up"; then
    echo "🐳 Iniciando contenedor frontend..."
    docker-compose up -d frontend
    sleep 10
fi

# Instalar navegadores de Playwright en el contenedor
echo "🌐 Instalando navegadores de Playwright en el contenedor..."
docker-compose exec frontend npx playwright install

# Ejecutar tests e2e en el contenedor (completamente desatendido)
echo "🚀 Ejecutando tests e2e (desatendido)..."
docker-compose exec frontend npx playwright test --reporter=list

# Verificar el código de salida
if [ $? -eq 0 ]; then
    echo "✅ Tests e2e completados exitosamente"
else
    echo "❌ Tests e2e fallaron"
    exit 1
fi