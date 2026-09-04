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
echo.
git pull
if errorlevel 1 goto :hata

echo.
echo Bagimliliklar guncelleniyor...
call npm install
if errorlevel 1 (
  echo.
  echo UYARI: npm install basarisiz oldu. Disk alaniniz yeterli mi?
  pause
  exit /b 1
)

echo.
echo Guncelleme tamamlandi. Programi AI-Ofis-Ac.bat ile acabilirsiniz.
pause
exit /b 0

:hata
echo.
echo ============================================================
echo   GUNCELLEME YAPILAMADI
echo ============================================================
echo.
echo Yukaridaki hata mesajina bakin:
echo.
echo * "Permission denied" ya da "cannot open" yaziyorsa:
echo     Bu bir izin sorunudur, internetle ilgisi yoktur.
echo     1) Acik olan "AI Ofis Sunucu" penceresini kapatin.
echo     2) Bu dosyaya SAG TIKLAYIP "Yonetici olarak calistir" secin.
echo     3) Duzelmezse: %APP_DIR%\data klasorunu bir yere kopyalayin
echo        (projeleriniz orada), sonra %APP_DIR% klasorunu silin ve
echo        AI-Ofis-Ac.bat ile bastan kurun. Sonra data klasorunu
echo        geri kopyalayin.
echo.
echo * "No space left" ya da "disk full" yaziyorsa:
echo     Diskinizde yer acmaniz gerekiyor.
echo.
echo * "Could not resolve host" ya da "unable to access" yaziyorsa:
echo     Bu gercekten bir internet sorunudur.
echo.
pause
exit /b 1
