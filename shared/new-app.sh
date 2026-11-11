#!/usr/bin/env bash
# Yeni bir Huzur oyunu projesi oluşturur:  shared/new-app.sh <klasör> <paket-son-eki> "<Uygulama Adı>"
# Örnek: shared/new-app.sh mines huzurmines "Huzur Mines"
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/$1"; SUFFIX="$2"; NAME="$3"
mkdir -p "$DIR/src" "$DIR/assets" "$DIR/scripts" "$DIR/store" "$DIR/docs"
for f in package.json app.json eas.json tsconfig.json index.ts eslint.config.js .gitignore; do cp "$ROOT/sudoku/$f" "$DIR/$f"; done
cp "$ROOT/sudoku/docs/style.css" "$DIR/docs/"
"$ROOT/shared/sync-kit.sh" "$1"
python3 - "$DIR" "$SUFFIX" "$NAME" <<'PY'
import json, sys
d, suffix, name = sys.argv[1:4]
p = f'{d}/package.json'; pk = json.load(open(p)); pk['name'] = 'huzur-' + suffix.replace('huzur', '')
pk['scripts']['check:game'] = 'tsx scripts/check-game.ts'
json.dump(pk, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
p = f'{d}/app.json'; cfg = json.load(open(p)); e = cfg['expo']
e['name'] = name; e['slug'] = 'huzur-' + suffix.replace('huzur', '')
e['ios']['bundleIdentifier'] = f'com.evrenaltindal.{suffix}'; e['android']['package'] = f'com.evrenaltindal.{suffix}'
json.dump(cfg, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
(cd "$DIR" && npm install --prefer-offline --no-audit --no-fund >/dev/null 2>&1)
echo "Oluşturuldu: $DIR"
