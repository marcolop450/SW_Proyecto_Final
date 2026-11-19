@echo off
chcp 65001 >nul
title ErgoCheck AI — Lanzador Automático Local

echo ============================================================
echo        ERGOCHECK AI — INICIANDO SERVIDORES LOCALES
echo ============================================================
echo.
echo [1/3] Iniciando Backend API (NestJS en puerto 3000)...
start "ErgoCheck AI - Backend (NestJS)" cmd /k "cd /d "%~dp0backend" && npm.cmd run start:dev"

echo [2/3] Iniciando Frontend Web (React Vite en puerto 5173)...
start "ErgoCheck AI - Frontend (React 19)" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo [3/3] Esperando 6 segundos a que los servidores inicialicen...
timeout /t 6 /nobreak >nul

echo.
echo Abriendo plataforma en tu navegador predeterminado...
start http://localhost:5173

echo.
echo ============================================================
echo   SISTEMA ACTIVO Y OPERATIVO EN TU PC
echo ============================================================
echo   Frontend Web:    http://localhost:5173
echo   Backend API:     http://localhost:3000/api
echo   Swagger Docs:    http://localhost:3000/api/docs
echo.
echo   Credenciales de acceso listas:
echo   - Correo:       jairo.camacho@visitask.com
echo   - Contraseña:   12345
echo   - Rol:          SUPERVISOR
echo.
echo   (Para cerrar los servidores ejecuta "detener-proyecto.bat")
echo ============================================================
echo.
pause
