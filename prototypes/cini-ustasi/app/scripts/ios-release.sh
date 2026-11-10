#!/usr/bin/env bash
# Uygulamayı arşivler, Apple'ın bulut imzalamasıyla imzalar ve App Store Connect'e yükler.
# fastlane'in build_upload işi çağırır; elle de çalışır (yalnızca macOS + Xcode).
# Kullanım: scripts/ios-release.sh <bundle-id> <derleme-numarası> <AuthKey.p8 yolu>
# Ortam: ASC_KEY_ID, ASC_ISSUER_ID, APPLE_TEAM_ID
set -euo pipefail

APP_ID="$1"
BUILD="$2"
KEY_PATH="$3"
: "${ASC_KEY_ID:?ASC_KEY_ID eksik}" "${ASC_ISSUER_ID:?ASC_ISSUER_ID eksik}" "${APPLE_TEAM_ID:?APPLE_TEAM_ID eksik}"

cd "$(dirname "$0")/.."
OUT=build/ios
rm -rf "$OUT" && mkdir -p "$OUT"

# API anahtarıyla otomatik imzalama: sertifika ve profil Apple tarafında yönetilir (anahtar Admin rolünde olmalı)
AUTH=(-allowProvisioningUpdates
      -authenticationKeyPath "$KEY_PATH"
      -authenticationKeyID "$ASC_KEY_ID"
      -authenticationKeyIssuerID "$ASC_ISSUER_ID")

echo "Arşivleniyor: $APP_ID, derleme $BUILD"
xcodebuild -quiet \
  -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$OUT/App.xcarchive" \
  "${AUTH[@]}" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" CODE_SIGN_STYLE=Automatic \
  PRODUCT_BUNDLE_IDENTIFIER="$APP_ID" CURRENT_PROJECT_VERSION="$BUILD" \
  archive

cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>signingStyle</key><string>automatic</string>
  <key>teamID</key><string>${APPLE_TEAM_ID}</string>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict>
</plist>
PLIST

echo "İmzalanıp App Store Connect'e yükleniyor"
xcodebuild -exportArchive \
  -archivePath "$OUT/App.xcarchive" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" \
  -exportPath "$OUT/export" \
  "${AUTH[@]}"

echo "Yüklendi. Apple derlemeyi işledikten sonra (genelde 15-30 dk) TestFlight sekmesinde görünür."
