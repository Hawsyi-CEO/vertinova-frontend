@echo off
echo ================================================
echo  VERTINOVA FRONTEND - PRODUCTION BUILD
echo ================================================
echo.

cd /d "%~dp0"

echo [1/3] Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Creating zip file for upload...
cd dist
powershell -command "Compress-Archive -Path * -DestinationPath ..\vertinova-frontend-production.zip -Force"
cd ..

echo.
echo [3/3] Done!
echo.
echo ================================================
echo  BUILD SUCCESSFUL!
echo ================================================
echo.
echo File siap upload: vertinova-frontend-production.zip
echo.
echo CARA DEPLOY:
echo 1. Buka cPanel File Manager
echo 2. Masuk ke: domains/vertinova.id/public_html/
echo 3. HAPUS semua file lama
echo 4. Upload vertinova-frontend-production.zip
echo 5. Extract zip file
echo 6. Hapus file zip setelah extract
echo.
echo File hash baru: index-DGtnkj29.css, index-DLZkwG9F.js
echo ================================================
pause
