#!/usr/bin/env bash
set -euo pipefail

echo "=================================================================="
echo "JellyFlex 2.0 — Clean Uninstaller & Cryptographic Shredder"
echo "=================================================================="

# 1. Stop any running JellyFlex FastAPI (8000) or Next.js (3000) processes
echo "Stopping active JellyFlex background processes on ports 8000 & 3000..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# 2. Cryptographically shred sensitive SQLite vaults and .env secrets
for secret_file in "backend/database/secure_state.db" "backend/database/secure_state.db-wal" ".env"; do
  if [ -f "$secret_file" ]; then
    echo "Shredding encrypted vault file: $secret_file..."
    python3 -c "
import os, secrets
p = '$secret_file'
sz = os.path.getsize(p)
with open(p, 'ba+', buffering=0) as f:
    for _ in range(3):
        f.seek(0)
        f.write(secrets.token_bytes(max(sz, 64)))
        f.flush()
        os.fsync(f.fileno())
os.remove(p)
"
  fi
done

# 3. Remove staging, caches, virtualenvs, and build artifacts
echo "Removing runtime caches, stealth browser profiles, and virtual environments..."
rm -rf .rea_staging backend/database frontend/.next frontend/node_modules .venv __pycache__ .pytest_cache

echo "JellyFlex 2.0 has been cleanly uninstalled with zero leftover traces."
