#!/bin/bash

# Script para ejecutar tests unitarios
echo "🧪 Ejecutando tests unitarios..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Ejecutar tests unitarios
echo "🚀 Ejecutando tests unitarios..."
npm test

# Verificar el código de salida
if [ $? -eq 0 ]; then
    echo "✅ Tests unitarios completados exitosamente"
else
    echo "❌ Tests unitarios fallaron"
    exit 1
fi
