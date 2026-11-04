#!/bin/bash
# Build script for Al Anfal Doc (cPanel Node.js hosting).
# Run from the application root:  bash install.sh
set -e
cd "$(dirname "$0")"

echo "Installing dependencies (dev dependencies are required for the build)..."
npm ci --no-audit --no-fund

echo "Building Next.js..."
npm run build

echo "Build complete."
echo "In cPanel -> Setup Node.js App:"
echo "  - Application root: this folder"
echo "  - Application startup file: server.js"
echo "  - Node.js version: 20.x or higher"
echo "  - Then click RESTART."
