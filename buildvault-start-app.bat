@echo off
echo Starting Construction Lead App...
echo.

cd /d "%~dp0mobile"

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting Expo web server...
echo The app will open in your browser at http://localhost:8081
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:8081

call npm run web
