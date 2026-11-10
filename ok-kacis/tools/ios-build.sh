#!/usr/bin/env bash
# Ok Kaçış iOS uygulamasını arşivler, dağıtım sertifikasıyla imzalar, doğrular ve
# App Store Connect'e yükler. fastlane'in "build" işi çağırır (yalnızca macOS + Xcode).
# Kullanım: tools/ios-build.sh <bundle-id> <sürüm> <derleme-numarası> <profil-uuid> [upload|no-upload]
# Ortam: APPLE_TEAM_ID, IOS_DISTRIBUTION_P12 (base64), IOS_P12_PASSWORD, ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8
set -euo pipefail

APP_ID="$1"
VERSION="$2"
BUILD="$3"
UUID="$4"
MODE="${5:-upload}"
: "${APPLE_TEAM_ID:?APPLE_TEAM_ID eksik}" "${IOS_DISTRIBUTION_P12:?IOS_DISTRIBUTION_P12 eksik}" "${IOS_P12_PASSWORD:?IOS_P12_PASSWORD eksik}"
: "${ASC_KEY_ID:?ASC_KEY_ID eksik}" "${ASC_ISSUER_ID:?ASC_ISSUER_ID eksik}" "${ASC_KEY_P8:?ASC_KEY_P8 eksik}"

cd "$(dirname "$0")/.."
OUT="$PWD/build/ios"
rm -rf "$OUT" && mkdir -p "$OUT"
umask 077
TMP="${RUNNER_TEMP:-$(mktemp -d)}"
P12="$TMP/okk-distribution.p12"
KC="$TMP/okk-signing.keychain-db"
KC_PASS="$(openssl rand -base64 24)"
KEY_DIR="$HOME/.appstoreconnect/private_keys"
KEY="$KEY_DIR/AuthKey_${ASC_KEY_ID}.p8"
cleanup() {
  rm -f "$P12" "$KEY"
  security delete-keychain "$KC" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== Sertifikayı geçici anahtarlığa al"
printf '%s' "$IOS_DISTRIBUTION_P12" | base64 -D > "$P12"
security create-keychain -p "$KC_PASS" "$KC"
security set-keychain-settings -lut 3600 "$KC"
security unlock-keychain -p "$KC_PASS" "$KC"
security import "$P12" -k "$KC" -P "$IOS_P12_PASSWORD" -T /usr/bin/codesign -T /usr/bin/security
security list-keychains -d user -s "$KC"
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KC_PASS" "$KC" >/dev/null

echo "== İmzalama ayarlarını yalnızca uygulama hedefine yaz (Swift paketleri etkilenmesin)"
PBX=ios/App/App.xcodeproj/project.pbxproj
n=$(grep -c 'CODE_SIGN_STYLE = Automatic;' "$PBX" || true)
if [ "$n" != "2" ]; then echo "Beklenmeyen proje yapısı: CODE_SIGN_STYLE satırı $n kez"; exit 1; fi
sed -i '' "s/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Manual; DEVELOPMENT_TEAM = ${APPLE_TEAM_ID}; PROVISIONING_PROFILE_SPECIFIER = \"${UUID}\"; \"CODE_SIGN_IDENTITY[sdk=iphoneos*]\" = \"iPhone Distribution\";/" "$PBX"

echo "== Arşivle: $APP_ID $VERSION ($BUILD)"
xcodebuild -quiet \
  -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$OUT/App.xcarchive" \
  MARKETING_VERSION="$VERSION" CURRENT_PROJECT_VERSION="$BUILD" \
  archive

cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>export</string>
  <key>signingStyle</key><string>manual</string>
  <key>signingCertificate</key><string>iPhone Distribution</string>
  <key>provisioningProfiles</key><dict>
    <key>${APP_ID}</key><string>${UUID}</string>
  </dict>
  <key>teamID</key><string>${APPLE_TEAM_ID}</string>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST

echo "== IPA oluştur"
xcodebuild -exportArchive -archivePath "$OUT/App.xcarchive" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" -exportPath "$OUT/export"

echo "== Doğrula"
IPA="$(find "$OUT/export" -maxdepth 1 -name '*.ipa' -print -quit)"
test -n "$IPA"
rm -rf "$TMP/okk-ipa" && mkdir -p "$TMP/okk-ipa"
unzip -q "$IPA" -d "$TMP/okk-ipa"
APP="$TMP/okk-ipa/Payload/App.app"
PL="$APP/Info.plist"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$PL")" = "$APP_ID"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$PL")" = "$VERSION"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleVersion' "$PL")" = "$BUILD"
/usr/libexec/PlistBuddy -c 'Print GADApplicationIdentifier' "$PL"
test -f "$APP/embedded.mobileprovision"
test -f "$APP/public/index.html"
codesign --verify --deep --strict --verbose=2 "$APP"
echo "IPA hazır: $(basename "$IPA") ($(du -h "$IPA" | cut -f1))"

if [ "$MODE" != upload ]; then
  echo "Yükleme atlandı (App Store Connect'te uygulama kaydı yok). Derleme ve imza doğrulandı."
  [ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "### Derlendi ve imzalandı (yüklenmedi): Ok Kaçış $VERSION ($BUILD)" >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

echo "== App Store Connect'e yükle"
mkdir -p "$KEY_DIR"
printf '%s\n' "$ASC_KEY_P8" > "$KEY"
xcrun altool --upload-app --type ios --file "$IPA" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
echo "Yüklendi: Ok Kaçış $VERSION ($BUILD). Apple işledikten sonra (15-30 dk) TestFlight'ta görünür."
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  echo "### Yüklendi: Ok Kaçış $VERSION (derleme $BUILD)" >> "$GITHUB_STEP_SUMMARY"
fi
