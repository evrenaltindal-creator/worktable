@echo off
title AI Ofis
setlocal

set "REPO_URL=https://github.com/evrenaltindal-creator/worktable.git"
set "REPO_BRANCH=claude/ai-office-interface-rs3zgo"
set "APP_DIR=%USERPROFILE%\AI-Ofis"

where git >nul 2>nul
if errorlevel 1 (
  echo HATA: Bilgisayarinizda Git kurulu degil.
  echo Once https://git-scm.com/downloads adresinden Git'i kurup
  echo bu dosyayi tekrar calistirin.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo HATA: Bilgisayarinizda Node.js kurulu degil.
  echo Once https://nodejs.org adresinden Node.js'i kurup
  echo bu dosyayi tekrar calistirin.
  pause
  exit /b 1
)

if not exist "%APP_DIR%" (
  echo AI Ofis ilk kez indiriliyor, bu biraz surebilir...
  git clone --branch "%REPO_BRANCH%" "%REPO_URL%" "%APP_DIR%"
  if errorlevel 1 (
    echo.
    echo HATA: Program indirilemedi. Internet baglantinizi kontrol edin.
    pause
    exit /b 1
  )
) else (
  echo Guncellemeler kontrol ediliyor...
  cd /d "%APP_DIR%"
  git pull
)

cd /d "%APP_DIR%"

if not exist node_modules (
  echo Ilk calistirma: bagimliliklar kuruluyor, birkac dakika surebilir...
  call npm install
  if errorlevel 1 (
    echo.
    echo HATA: npm install basarisiz oldu.
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
