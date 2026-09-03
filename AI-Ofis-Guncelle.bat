@echo off
title AI Ofis - Guncelle
setlocal

rem Bu dosya SADECE guncelleme icindir ve internete baglanir.
rem Programi normal kullanmak icin AI-Ofis-Ac.bat yeterlidir.

if exist F:\ (
  set "APP_DIR=F:\AI-Ofis"
  set "NPM_CONFIG_CACHE=F:\AI-Ofis-npm-cache"
) else (
  set "APP_DIR=%USERPROFILE%\AI-Ofis"
)

if not exist "%APP_DIR%\package.json" (
  echo Program bulunamadi: %APP_DIR%
  echo Once AI-Ofis-Ac.bat ile kurulumu yapin.
  pause
  exit /b 1
)

cd /d "%APP_DIR%"

echo Guncellemeler indiriliyor...
git pull
if errorlevel 1 (
  echo.
  echo HATA: Guncelleme alinamadi. Internet baglantinizi kontrol edin.
  pause
  exit /b 1
)

echo Bagimliliklar guncelleniyor...
call npm install

echo.
echo Guncelleme tamamlandi. Programi AI-Ofis-Ac.bat ile acabilirsiniz.
pause
