@echo off
setlocal

echo Starting BuildVault Internet Platform...
echo.

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"

if not exist "%BACKEND_DIR%\package.json" (
  echo ERROR: backend package.json not found.
  echo Expected path: "%BACKEND_DIR%"
  pause
  exit /b 1
)

start "BuildVault Backend" cmd /k cd /d "%BACKEND_DIR%" ^&^& npm run dev

echo Waiting for backend to be ready on http://localhost:3000 ...
set "READY=0"
for /L %%i in (1,1,30) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "if ((Test-NetConnection -ComputerName 'localhost' -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }"
  if not errorlevel 1 (
    set "READY=1"
    goto :openbrowser
  )
  timeout /t 1 /nobreak >nul
)

:openbrowser
start "" http://localhost:3000
if "%READY%"=="0" (
  echo WARNING: Browser opened before server confirmed ready. If page fails, wait a few seconds and refresh.
)

echo.
echo BuildVault Internet Platform is launching:
echo - Backend terminal: npm run dev
echo - Browser: http://localhost:3000
echo.
exit /b 0
