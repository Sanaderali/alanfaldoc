#!/bin/bash
# Installation script for Al Anfal Doc

echo "Installing Al Anfal Doc..."
cd /home/alanuucp/alanfaldoc

echo "Installing dependencies..."
npm install --production

echo "Building Next.js..."
npm run build

echo "Installation complete!"
echo "Now go to cPanel -> Setup Node.js App and configure:"
echo "  - Application root: alanfaldoc"
echo "  - Application startup file: server.js"
echo "  - Node.js version: 18.x or higher"
