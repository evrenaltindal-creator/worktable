# Huzur oyunlarını derleyip App Store Connect'e gönderir (Windows PowerShell).
#
# Kullanım ("huzur" klasöründe, yani depo kökünde):
#   Hepsi, sırayla:   powershell -ExecutionPolicy Bypass -File shared\yukle.ps1
#   Tek bir oyun:     powershell -ExecutionPolicy Bypass -File shared\yukle.ps1 sudoku
#
# Her oyunun derlemesi Expo sunucularında sıraya alınır; betik bitmesini beklemeden sıradakine geçer.
# Derleme bitince Expo onu App Store Connect'e kendisi gönderir (--auto-submit).
# Biten oyunlar shared\yuklenenler.txt dosyasına yazılır; betik yarıda kalırsa tekrar çalıştırın,
# kaldığı yerden devam eder. Bir oyunu yeniden yüklemek için adını o dosyadan silin.
# Apple ID, şifre ve telefon kodu sorulursa kendiniz yanıtlayın; sertifika/profil sorularına Y deyin.

param([string]$oyun = '')

$oyunlar = @('sudoku', 'mines', 'bubbles', 'jewels', 'blocks', 'colorpop', 'jigsaw', 'words', 'cube', 'mahjong')
$kok = Split-Path -Parent $PSScriptRoot
$kayit = Join-Path $PSScriptRoot 'yuklenenler.txt'

function Adim($baslik, $komut) {
    Write-Host "`n-- $baslik --" -ForegroundColor Yellow
    Invoke-Expression $komut
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n'$baslik' adımı hata verdi. Yukarıdaki mesajı Claude'a yapıştırın." -ForegroundColor Red
        Write-Host "Düzelttikten sonra aynı komutu yeniden çalıştırın; biten oyunlar atlanır." -ForegroundColor Red
        exit 1
    }
}

function Yukle($ad) {
    $klasor = Join-Path $kok $ad
    Set-Location $klasor
    Write-Host "`n==================== $ad ====================" -ForegroundColor Cyan
    Adim "$ad : paketler kuruluyor" 'npm install'
    # Expo projesi (yalnız ilk sefer oluşturulur; mahjong için var olan projeye bağlanın)
    $app = Get-Content (Join-Path $klasor 'app.json') -Raw | ConvertFrom-Json
    if (-not $app.expo.extra.eas.projectId) { Adim "$ad : Expo projesi" 'npx --yes eas-cli@latest init' }
    Adim "$ad : iOS derlemesi sıraya alınıyor" 'npx --yes eas-cli@latest build --platform ios --profile production --auto-submit --no-wait'
    # Mağaza metinleri (7 dil), kategoriler ve yaş derecelendirmesi: store.config.json -> App Store Connect
    Write-Host "`n-- $ad : mağaza metinleri yükleniyor --" -ForegroundColor Yellow
    npx --yes eas-cli@latest metadata:push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "$ad : metinler yüklenemedi; daha sonra '$ad' klasöründe 'npx eas-cli@latest metadata:push' ile tekrar deneyin." -ForegroundColor DarkYellow
    }
    Add-Content -Path $kayit -Value $ad
    Write-Host "$ad sıraya alındı." -ForegroundColor Green
}

if ($oyun -and $oyunlar -notcontains $oyun) {
    Write-Host "Bilinmeyen oyun: $oyun. Şunlardan biri olmalı: $($oyunlar -join ', ')" -ForegroundColor Red
    exit 1
}

# Expo hesabına giriş (yalnız ilk sefer sorar)
npx --yes eas-cli@latest whoami *> $null
if ($LASTEXITCODE -ne 0) { Adim 'Expo hesabına giriş' 'npx --yes eas-cli@latest login' }

if ($oyun) {
    Yukle $oyun
} else {
    $biten = @()
    if (Test-Path $kayit) { $biten = Get-Content $kayit }
    foreach ($ad in $oyunlar) {
        if ($biten -contains $ad) { Write-Host "$ad daha önce yüklendi, atlanıyor." -ForegroundColor DarkGray; continue }
        Yukle $ad
    }
}

Set-Location $kok
Write-Host "`nBitti. Derlemelerin durumunu https://expo.dev adresinde, hesabınızdaki projelerde izleyebilirsiniz." -ForegroundColor Green
Write-Host "Her derleme bitince Expo onu App Store Connect'e gönderir; Apple işledikten sonra (10-30 dk) TestFlight'ta görünür."
Write-Host "Sonra her uygulama için: store\APP-STORE-CONNECT.md adımları, store\screenshots ekran görüntüleri, İncelemeye Gönder."
