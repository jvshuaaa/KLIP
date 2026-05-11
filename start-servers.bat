@echo off
echo Starting servers...

cd /d c:\laragon\www\KLIP\backend
start "Backend" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

cd /d c:\laragon\www\KLIP\frontend  
start "Frontend" cmd /k "npm run dev"

echo Servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
