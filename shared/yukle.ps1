# Bir Huzur oyununu derleyip App Store Connect'e gönderir (Windows PowerShell).
#
# Kullanım ("huzur" klasöründe, yani depo kökünde):
#   powershell -ExecutionPolicy Bypass -File shared\yukle.ps1 sudoku
#
# Oyun klasörleri: mahjong sudoku mines bubbles jewels blocks colorpop jigsaw words cube
# Apple ID ve şifre soruları gelirse kendiniz yanıtlayın; sertifika sorularına Y deyin.

param([Parameter(Mandatory = $true)][string]$oyun)

$oyunlar = @('mahjong', 'sudoku', 'mines', 'bubbles', 'jewels', 'blocks', 'colorpop', 'jigsaw', 'words', 'cube')
if ($oyunlar -notcontains $oyun) {
    Write-Host "Bilinmeyen oyun: $oyun. Şunlardan biri olmalı: $($oyunlar -join ', ')" -ForegroundColor Red
    exit 1
}

$kok = Split-Path -Parent $PSScriptRoot
$klasor = Join-Path $kok $oyun
Set-Location $klasor
Write-Host "`n== $oyun klasöründe çalışılıyor: $klasor ==" -ForegroundColor Cyan

function Adim($baslik, $komut) {
    Write-Host "`n-- $baslik --" -ForegroundColor Yellow
    Invoke-Expression $komut
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n'$baslik' adımı hata verdi. Yukarıdaki mesajı Claude'a yapıştırın." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Adim 'Paketler kuruluyor' 'npm install'

# Expo hesabına giriş (yalnız ilk sefer sorar)
npx --yes eas-cli@latest whoami *> $null
if ($LASTEXITCODE -ne 0) { Adim 'Expo hesabına giriş' 'npx --yes eas-cli@latest login' }

# Expo projesi (yalnız ilk sefer oluşturulur; mahjong için var olan projeye bağlanın)
$app = Get-Content (Join-Path $klasor 'app.json') -Raw | ConvertFrom-Json
if (-not $app.expo.extra.eas.projectId) { Adim 'Expo projesi oluşturuluyor' 'npx --yes eas-cli@latest init' }

# Derle ve bitince App Store Connect'e otomatik gönder (Expo sunucularında 15-30 dakika sürer)
Adim 'iOS derlemesi ve App Store Connect gönderimi' 'npx --yes eas-cli@latest build --platform ios --profile production --auto-submit'

Write-Host "`nTamam: $oyun derlendi ve App Store Connect'e gönderildi." -ForegroundColor Green
Write-Host "Mağaza metinleri ve rehber: $klasor\store\APP-STORE-CONNECT.md"
Write-Host "Ekran görüntüleri:          $klasor\store\screenshots"
Write-Host "Apple işlemeyi bitirince (10-30 dk) build, App Store Connect > TestFlight'ta görünür."
