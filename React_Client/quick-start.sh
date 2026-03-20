#!/bin/bash

# Script de inicio rápido para el monorepo ARSW
# Uso: ./quick-start.sh

echo "🚀 ARSW Labs - Inicio Rápido"
echo "=============================="
echo ""

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java no encontrado. Instala Java 21."
    exit 1
fi

echo "☕ Java versión:"
java -version
echo ""

# Verificar Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js 18+."
    exit 1
fi

echo "📦 Node.js versión:"
node -v
npm -v
echo ""

# Instalar dependencias frontend
echo "📥 Instalando dependencias del frontend..."
npm install
echo ""

# Compilar backend
echo "🔨 Compilando backend..."
cd BluePrints
mvn clean install -DskipTests
cd ..
echo ""

# Iniciar PostgreSQL (opcional)
read -p "¿Iniciar PostgreSQL con Docker? (s/n): " start_docker
if [ "$start_docker" = "s" ]; then
    echo "🐳 Iniciando PostgreSQL..."
    cd BluePrints
    docker-compose up -d
    cd ..
    echo "✅ PostgreSQL iniciado en puerto 5432"
    echo ""
    
    # Esperar a que PostgreSQL esté listo
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 5
fi

echo ""
echo "✅ Setup completado!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Iniciar el backend (en una terminal):"
echo "   npm run backend:run"
echo "   (o con PostgreSQL: npm run backend:postgres)"
echo ""
echo "2. Iniciar el frontend (en otra terminal):"
echo "   npm run dev"
echo ""
echo "3. Abrir navegador:"
echo "   http://localhost:5173"
echo ""
echo "🔐 Credenciales:"
echo "   Usuario: user"
echo "   Password: password123"
echo ""
echo "📚 Más info: README_MAIN.md"
