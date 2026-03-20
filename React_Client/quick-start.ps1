# Script de inicio rápido para el monorepo ARSW (Windows PowerShell)
# Uso: .\quick-start.ps1

Write-Host "🚀 ARSW Labs - Inicio Rápido" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Verificar Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "☕ Java instalado:" -ForegroundColor Green
    Write-Host $javaVersion[0]
} catch {
    Write-Host "❌ Java no encontrado. Instala Java 21." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar Node
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "📦 Node.js instalado:" -ForegroundColor Green
    Write-Host "   Node: $nodeVersion"
    Write-Host "   npm:  $npmVersion"
} catch {
    Write-Host "❌ Node.js no encontrado. Instala Node.js 18+." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Instalar dependencias frontend
Write-Host "📥 Instalando dependencias del frontend..." -ForegroundColor Yellow
npm install
Write-Host ""

# Compilar backend
Write-Host "🔨 Compilando backend..." -ForegroundColor Yellow
Set-Location BluePrints
mvn clean install -DskipTests
Set-Location ..
Write-Host ""

# Iniciar PostgreSQL (opcional)
$startDocker = Read-Host "¿Iniciar PostgreSQL con Docker? (s/n)"
if ($startDocker -eq "s") {
    Write-Host "🐳 Iniciando PostgreSQL..." -ForegroundColor Yellow
    Set-Location BluePrints
    docker-compose up -d
    Set-Location ..
    Write-Host "✅ PostgreSQL iniciado en puerto 5432" -ForegroundColor Green
    Write-Host ""
    
    # Esperar a que PostgreSQL esté listo
    Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "✅ Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Iniciar el backend (en una terminal):"
Write-Host "   npm run backend:run" -ForegroundColor White
Write-Host "   (o con PostgreSQL: npm run backend:postgres)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Iniciar el frontend (en otra terminal):"
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Abrir navegador:"
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Credenciales:" -ForegroundColor Yellow
Write-Host "   Usuario: user"
Write-Host "   Password: password123"
Write-Host ""
Write-Host "📚 Más info: README_MAIN.md" -ForegroundColor Cyan
