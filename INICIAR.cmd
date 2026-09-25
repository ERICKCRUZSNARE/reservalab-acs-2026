@echo off
cd /d "%~dp0"
if not exist .env copy .env.example .env >nul
if not exist node_modules (
  echo Ejecuta primero: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
  pause
  exit /b 1
)
npm run dev
