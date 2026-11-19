@echo off
chcp 65001 >nul
title ErgoCheck AI — Detener Servidores Locales

echo ============================================================
echo       ERGOCHECK AI — DETENIENDO SERVIDORES LOCALES
echo ============================================================
echo.
echo Deteniendo procesos en puertos 3000 (Backend) y 5173 (Frontend)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Servidores locales detenidos correctamente.
echo.
pause
