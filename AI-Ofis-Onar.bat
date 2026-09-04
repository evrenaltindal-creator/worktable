@echo off
title AI Ofis - Onar
setlocal

rem Bozulmus kurulumu onarir. Uc durumu da ele alir:
rem   A) Kurulum saglam  -> hafif onarim (izinler + guncelleme)
rem   B) Ic ice klasor   -> onceki hatali onarimdan kalan yapiyi duzeltir
rem   C) Kurulum bozuk   -> projeleri koruyarak bastan kurar

set "REPO_URL=https://github.com/evrenaltindal-creator/worktable.git"
set "REPO_BRANCH=claude/ai-office-interface-rs3zgo"
set "APP_NAME=AI-Ofis"

if exist F:\ (
  set "ROOT=F:"
  set "NPM_CONFIG_CACHE=F:\AI-Ofis-npm-cache"
) else (
  set "ROOT=%USERPROFILE%"
)

set "APP_DIR=%ROOT%\%APP_NAME%"
set "NEW_DIR=%ROOT%\%APP_NAME%-yeni"
set "OLD_DIR=%ROOT%\%APP_NAME%-eski"
set "TMP_DIR=%ROOT%\%APP_NAME%-kurtarma"

echo ============================================================
echo   AI OFIS ONARIM
echo ============================================================
echo.
echo Klasor: %APP_DIR%
echo.
echo ONEMLI: Acik "AI Ofis Sunucu" penceresi varsa simdi kapatin.
echo.
pause

rem Bu betik %APP_DIR% icinde durursa klasoru tasiyamayiz.
cd /d "%ROOT%\"

rem ---------- B) Ic ice kalmis kurulumu kurtar ----------
if exist "%APP_DIR%\%APP_NAME%-yeni\package.json" (
  echo.
  echo Ic ice gecmis kurulum bulundu, duzeltiliyor...
  if exist "%TMP_DIR%" rmdir /s /q "%TMP_DIR%"
  move "%APP_DIR%\%APP_NAME%-yeni" "%TMP_DIR%" >nul
  if errorlevel 1 (
    echo HATA: Ic klasor cikarilamadi. Tum pencereleri kapatip tekrar deneyin.
    pause
    exit /b 1
  )
  if exist "%APP_DIR%\data" xcopy "%APP_DIR%\data" "%TMP_DIR%\data\" /E /I /Y /Q >nul
  if exist "%APP_DIR%\.env" copy /y "%APP_DIR%\.env" "%TMP_DIR%\.env" >nul
  call :swap_in "%TMP_DIR%"
  if errorlevel 1 exit /b 1
  goto :kur_bagimliliklar
)

rem ---------- A) Kurulum saglamsa hafif onarim ----------
rem NOT: errorlevel kontrolleri parantez blogu icinde dogru calismaz
rem (blok tek seferde cozumlenir), bu yuzden etiketlerle yaziliyor.
if not exist "%APP_DIR%\package.json" goto :bastan_kur

echo.
echo [1/2] Salt-okunur isaretleri temizleniyor...
attrib -R "%APP_DIR%\*" /S /D >nul 2>nul

echo [2/2] Guncelleme deneniyor...
pushd "%APP_DIR%"
git pull >nul 2>nul
if errorlevel 1 goto :hafif_yetmedi
popd
echo.
echo Sorun cozuldu, guncelleme alindi.
goto :kur_bagimliliklar

:hafif_yetmedi
popd
echo     Hafif onarim yetmedi, bastan kurulum yapilacak.

rem ---------- C) Bastan kur ----------
:bastan_kur
echo.
echo Program yeniden kuruluyor (projeleriniz korunacak)...
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo HATA: Git bulunamadi. https://git-scm.com/downloads
  pause
  exit /b 1
)

if exist "%NEW_DIR%" rmdir /s /q "%NEW_DIR%"
echo     Program indiriliyor...
git clone --branch "%REPO_BRANCH%" "%REPO_URL%" "%NEW_DIR%"
if errorlevel 1 (
  echo.
  echo HATA: Program indirilemedi. Disk alaniniz ve internetiniz yeterli mi?
  pause
  exit /b 1
)

if exist "%APP_DIR%\data" (
  echo     Projeleriniz tasiniyor...
  xcopy "%APP_DIR%\data" "%NEW_DIR%\data\" /E /I /Y /Q >nul
)
if exist "%APP_DIR%\.env" copy /y "%APP_DIR%\.env" "%NEW_DIR%\.env" >nul

call :swap_in "%NEW_DIR%"
if errorlevel 1 exit /b 1

:kur_bagimliliklar
cd /d "%APP_DIR%"
echo.
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
if exist "%OLD_DIR%" echo Her sey calisiyorsa su klasoru silebilirsiniz: %OLD_DIR%
echo.
pause
exit /b 0

rem ---- Verilen klasoru AI-Ofis yerine koyar, eskisini kenara alir ----
rem "move" hedef klasor varsa icine tasidigi icin burada "ren" kullanilir:
rem ren hedefi zaten varsa hata verir, sessizce ic ice klasor olusturmaz.
:swap_in
set "KAYNAK=%~1"

if exist "%APP_DIR%" (
  if exist "%OLD_DIR%" rmdir /s /q "%OLD_DIR%"
  ren "%APP_DIR%" "%APP_NAME%-eski"
  if errorlevel 1 (
    echo.
    echo HATA: Eski klasor kenara alinamadi - hala kullanimda olabilir.
    echo Acik tum pencereleri kapatip tekrar deneyin.
    echo Yeni kurulum burada bekliyor: %KAYNAK%
    pause
    exit /b 1
  )
)

if exist "%APP_DIR%" (
  echo HATA: %APP_DIR% hala duruyor, devam edilemiyor.
  pause
  exit /b 1
)

ren "%KAYNAK%" "%APP_NAME%"
if errorlevel 1 (
  echo HATA: Yeni kurulum yerine konamadi: %KAYNAK%
  pause
  exit /b 1
)
exit /b 0
