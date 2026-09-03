@echo off
title AI Ofis
setlocal

set "REPO_URL=https://github.com/evrenaltindal-creator/worktable.git"
set "REPO_BRANCH=claude/ai-office-interface-rs3zgo"

rem C: diski dolu olan kullanicilar icin: F: varsa program oraya kurulur.
if exist F:\ (
  set "APP_DIR=F:\AI-Ofis"
  set "NPM_CONFIG_CACHE=F:\AI-Ofis-npm-cache"
) else (
  set "APP_DIR=%USERPROFILE%\AI-Ofis"
)

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

echo Kurulum konumu: %APP_DIR%
echo.

if not exist "%APP_DIR%" (
  echo AI Ofis ilk kez indiriliyor, bu biraz surebilir...
  git clone --branch "%REPO_BRANCH%" "%REPO_URL%" "%APP_DIR%"
  if errorlevel 1 (
    echo.
    echo HATA: Program indirilemedi.
    echo - Yukarida "No space left on device" yaziyorsa diskiniz dolu:
    echo   Geri Donusum Kutusu'nu bosaltip disk temizligi yapin.
    echo - Baska bir hata varsa internet baglantinizi kontrol edin.
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
    echo Bu genellikle disk alani dolmasindan kaynaklanir; diskinizde
    echo yeterli bos alan oldugundan emin olup tekrar deneyin.
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
