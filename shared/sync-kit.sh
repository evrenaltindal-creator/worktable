#!/usr/bin/env bash
# Ortak kiti (shared/kit) ve ortak görselleri bir uygulamaya kopyalar:  shared/sync-kit.sh <klasör>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/$1"
mkdir -p "$DIR/src/kit" "$DIR/assets/ui"
cp -r "$ROOT/shared/kit/." "$DIR/src/kit/"
cp -r "$ROOT/shared/assets/scenes" "$ROOT/shared/assets/fx" "$ROOT/shared/assets/sounds" "$DIR/assets/"
cp "$ROOT/shared/assets/ui/"*.png "$DIR/assets/ui/"
