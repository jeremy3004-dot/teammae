#!/bin/bash
# TeamMAE.ai Development Server
# Starts all packages in watch mode + web app

echo "🚀 Starting TeamMAE.ai development environment..."
echo ""
echo "Building packages first..."
pnpm -r --filter='!@teammae/web' build

echo ""
echo "Starting dev servers..."
pnpm dev
