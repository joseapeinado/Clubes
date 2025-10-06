#!/bin/bash

# Script para ejecutar todos los tests
echo "🚀 Ejecutando todos los tests..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Hacer ejecutables los scripts
chmod +x scripts/*.sh

# Ejecutar tests unitarios
echo "📋 Paso 1/2: Tests unitarios"
./scripts/run-unit-tests.sh
if [ $? -ne 0 ]; then
    echo "❌ Tests unitarios fallaron. Abortando ejecución de tests e2e."
    exit 1
fi

# Ejecutar tests e2e
echo "📋 Paso 2/2: Tests e2e"
./scripts/run-e2e-tests.sh
if [ $? -ne 0 ]; then
    echo "❌ Tests e2e fallaron."
    exit 1
fi

echo "✅ Todos los tests completados exitosamente"
