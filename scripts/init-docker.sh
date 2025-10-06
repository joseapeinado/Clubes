#!/bin/bash

# Script para inicializar el entorno Docker
echo "🐳 Inicializando entorno Docker..."

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose. Por favor, inicia Docker Desktop."
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir y levantar contenedores
echo "🔨 Construyendo y levantando contenedores..."
docker-compose build
docker-compose up -d

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 10

# Verificar que el servicio esté funcionando
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Mostrar logs del frontend
echo "📋 Mostrando logs del frontend..."
docker-compose logs frontend

echo "✅ Entorno Docker inicializado correctamente"
echo "🌐 La aplicación debería estar disponible en: http://localhost:3001"
