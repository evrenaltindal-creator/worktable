@echo off
title AI Ofis
cd /d "%~dp0"

if not exist node_modules (
  echo Ilk calistirma: bagimliliklar kuruluyor, birkac dakika surebilir...
  call npm install
  if errorlevel 1 (
    echo.
    echo HATA: npm install basarisiz oldu. Node.js kurulu mu kontrol edin.
    pause
    exit /b 1
  )
)

if not exist .env (
  copy .env.example .env >nul
)

echo AI Ofis sunucusu baslatiliyor...
start "AI Ofis Sunucu" cmd /k "npm run dev"

echo Tarayici birazdan acilacak, sunucunun ayaga kalkmasi bekleniyor...
timeout /t 6 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Bu pencereyi kapatabilirsiniz. Sunucuyu tamamen durdurmak icin
echo acilan "AI Ofis Sunucu" adli siyah pencereyi kapatin.
pause
