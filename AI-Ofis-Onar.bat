@echo off
title AI Ofis - Onar
setlocal enabledelayedexpansion

rem Bozulmus kurulumu onarir. Once hafif yontemi dener (salt-okunur
rem isaretlerini temizleyip guncellemeyi tekrar dener); ise yaramazsa
rem projelerinizi (data klasoru) koruyarak programi bastan kurar.

set "REPO_URL=https://github.com/evrenaltindal-creator/worktable.git"
set "REPO_BRANCH=claude/ai-office-interface-rs3zgo"

if exist F:\ (
  set "APP_DIR=F:\AI-Ofis"
  set "NPM_CONFIG_CACHE=F:\AI-Ofis-npm-cache"
) else (
  set "APP_DIR=%USERPROFILE%\AI-Ofis"
)

echo ============================================================
echo   AI OFIS ONARIM
echo ============================================================
echo.
echo Klasor: %APP_DIR%
echo.
echo ONEMLI: Acik "AI Ofis Sunucu" penceresi varsa simdi kapatin.
echo.
pause

if not exist "%APP_DIR%\package.json" (
  echo Kurulum bulunamadi. AI-Ofis-Ac.bat ile bastan kurabilirsiniz.
  pause
  exit /b 1
)

echo.
echo [1/3] Salt-okunur isaretleri temizleniyor...
attrib -R "%APP_DIR%\*" /S /D >nul 2>nul

cd /d "%APP_DIR%"
echo [2/3] Guncelleme tekrar deneniyor...
git pull >nul 2>nul
if not errorlevel 1 (
  echo.
  echo Sorun cozuldu, guncelleme alindi.
  call npm install
  echo.
  echo Bitti. AI-Ofis-Ac.bat ile acabilirsiniz.
  pause
  exit /b 0
)

echo     Hafif onarim yetmedi, bastan kurulum yapilacak.
echo.
echo [3/3] Projeleriniz korunarak program yeniden kuruluyor...
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo HATA: Git bulunamadi. https://git-scm.com/downloads
  pause
  exit /b 1
)

set "NEW_DIR=%APP_DIR%-yeni"
set "OLD_DIR=%APP_DIR%-eski"

if exist "%NEW_DIR%" rmdir /s /q "%NEW_DIR%" >nul 2>nul
if exist "%OLD_DIR%" rmdir /s /q "%OLD_DIR%" >nul 2>nul

cd /d "%~dp0"
echo     Program indiriliyor...
git clone --branch "%REPO_BRANCH%" "%REPO_URL%" "%NEW_DIR%"
if errorlevel 1 (
  echo.
  echo HATA: Program indirilemedi. Disk alaniniz ve internetiniz yeterli mi?
  pause
  exit /b 1
)

if exist "%APP_DIR%\data" (
  echo     Projeleriniz yeni kuruluma tasiniyor...
  xcopy "%APP_DIR%\data" "%NEW_DIR%\data\" /E /I /Y /Q >nul
)
if exist "%APP_DIR%\.env" copy "%APP_DIR%\.env" "%NEW_DIR%\.env" >nul

echo     Eski kurulum kenara aliniyor...
move "%APP_DIR%" "%OLD_DIR%" >nul 2>nul
if errorlevel 1 (
  echo.
  echo HATA: Eski klasor tasinamadi - hala kullanimda olabilir.
  echo Acik tum AI Ofis / sunucu pencerelerini kapatip tekrar deneyin.
  echo Yeni kurulum burada bekliyor: %NEW_DIR%
  pause
  exit /b 1
)

move "%NEW_DIR%" "%APP_DIR%" >nul 2>nul
if errorlevel 1 (
  echo HATA: Yeni klasor yerine tasinamadi: %NEW_DIR%
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
echo     Bagimliliklar kuruluyor (birkac dakika surebilir)...
call npm install
if errorlevel 1 (
  echo.
  echo UYARI: npm install basarisiz oldu. Disk alaniniz yeterli mi?
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   ONARIM TAMAMLANDI
echo ============================================================
echo.
echo Projeleriniz korundu. AI-Ofis-Ac.bat ile acabilirsiniz.
echo.
echo Her sey calisiyorsa su klasoru silebilirsiniz: %OLD_DIR%
echo.
pause
