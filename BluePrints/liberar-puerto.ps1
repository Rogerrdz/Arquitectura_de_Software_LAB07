# Script para liberar el puerto 8080 u 8081
# Uso: .\liberar-puerto.ps1 [puerto]
# Ejemplo: .\liberar-puerto.ps1 8080

param(
    [int]$Puerto = 8080
)

Write-Host "`n=== Liberando Puerto $Puerto ===" -ForegroundColor Cyan

# Buscar procesos usando el puerto
$conexiones = netstat -ano | Select-String ":$Puerto " | Select-String "LISTENING"

if ($conexiones) {
    Write-Host "Procesos encontrados usando el puerto ${Puerto}:" -ForegroundColor Yellow
    
    $pids = @()
    foreach ($linea in $conexiones) {
        $partes = $linea -split '\s+' | Where-Object { $_ -ne '' }
        $pid = $partes[-1]
        
        if ($pid -match '^\d+$' -and $pids -notcontains $pid) {
            $pids += $pid
            try {
                $proceso = Get-Process -Id $pid -ErrorAction Stop
                Write-Host "  PID: $pid - Proceso: $($proceso.ProcessName)" -ForegroundColor White
            } catch {
                Write-Host "  PID: $pid - Proceso: (no se pudo obtener nombre)" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "`n¿Deseas detener estos procesos? (S/N)" -ForegroundColor Yellow
    $respuesta = Read-Host
    
    if ($respuesta -eq 'S' -or $respuesta -eq 's') {
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "  ✓ Proceso $pid detenido" -ForegroundColor Green
            } catch {
                Write-Host "  ✗ No se pudo detener el proceso $pid" -ForegroundColor Red
            }
        }
        
        Write-Host "`nPuerto $Puerto liberado exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "`nOperación cancelada." -ForegroundColor Yellow
    }
} else {
    Write-Host "El puerto $Puerto está libre." -ForegroundColor Green
}

Write-Host "`nVerificando puertos disponibles:" -ForegroundColor Cyan
foreach ($p in @(8080, 8081, 8082, 8083)) {
    $ocupado = netstat -ano | Select-String ":$p " | Select-String "LISTENING"
    if ($ocupado) {
        Write-Host "  Puerto $p : OCUPADO" -ForegroundColor Red
    } else {
        Write-Host "  Puerto $p : DISPONIBLE" -ForegroundColor Green
    }
}

Write-Host ""
