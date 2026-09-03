@echo off
title AI Ofis
setlocal

rem ---------------------------------------------------------------
rem Bu baslatici, program bir kez kurulduktan sonra INTERNETE HIC
rem BAGLANMAZ. Guncelleme istediginizde AI-Ofis-Guncelle.bat kullanin.
rem ---------------------------------------------------------------

set "REPO_URL=https://github.com/evrenaltindal-creator/worktable.git"
set "REPO_BRANCH=claude/ai-office-interface-rs3zgo"

rem C: diski dolu olan kullanicilar icin: F: varsa program oraya kurulur.
if exist F:\ (
  set "APP_DIR=F:\AI-Ofis"
  set "NPM_CONFIG_CACHE=F:\AI-Ofis-npm-cache"
) else (
  set "APP_DIR=%USERPROFILE%\AI-Ofis"
)

where node >nul 2>nul
if errorlevel 1 (
  echo HATA: Bilgisayarinizda Node.js kurulu degil.
  echo Once https://nodejs.org adresinden Node.js'i kurup
  echo bu dosyayi tekrar calistirin.
  pause
  exit /b 1
)

if not exist "%APP_DIR%\package.json" (
  echo Program henuz kurulu degil, ilk kurulum yapiliyor...
  echo (Bu ADIM icin internet gerekir; sonraki acilislarda gerekmez.)
  echo.

  where git >nul 2>nul
  if errorlevel 1 (
    echo HATA: Ilk kurulum icin Git gerekli.
    echo https://git-scm.com/downloads adresinden kurup tekrar deneyin.
    pause
    exit /b 1
  )

  git clone --branch "%REPO_BRANCH%" "%REPO_URL%" "%APP_DIR%"
  if errorlevel 1 (
    echo.
    echo HATA: Program indirilemedi.
    echo - "No space left on device" yaziyorsa diskiniz dolu:
    echo   Geri Donusum Kutusu'nu bosaltip disk temizligi yapin.
    echo - Baska bir hata varsa internet baglantinizi kontrol edin.
    pause
    exit /b 1
  )
)

cd /d "%APP_DIR%"

if not exist node_modules (
  echo Bagimliliklar kuruluyor, birkac dakika surebilir...
  echo (Bu ADIM icin internet gerekir; sonraki acilislarda gerekmez.)
  call npm install
  if errorlevel 1 (
    echo.
    echo HATA: npm install basarisiz oldu.
    echo Diskinizde yeterli bos alan oldugundan emin olup tekrar deneyin.
    pause
    exit /b 1
  )
)

if not exist .env (
  copy .env.example .env >nul
)

echo.
echo AI Ofis baslatiliyor - CEVRIMDISI MOD (veriler bilgisayarinizdan cikmaz)
start "AI Ofis Sunucu" cmd /k "npm run dev"

echo Tarayici birazdan acilacak, sunucunun ayaga kalkmasi bekleniyor...
timeout /t 6 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo Bu pencereyi kapatabilirsiniz. Sunucuyu tamamen durdurmak icin
echo acilan "AI Ofis Sunucu" adli siyah pencereyi kapatin.
pause
