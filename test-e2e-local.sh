#!/bin/bash
#
# Helper script to run E2E tests with local development build
# This script sets up your local app in nRF Connect for Desktop and runs tests
# Copyright (c) 2025 Nordic Semiconductor ASA
# SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
#

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_NAME="pc-nrfconnect-matter-quickstart"
LOCAL_APPS_DIR="$HOME/.nrfconnect-apps/local"

echo "=== E2E Testing Setup for Local Development ==="
echo ""

# Step 1: Create local apps directory
if [ ! -d "$LOCAL_APPS_DIR" ]; then
    echo "Creating local apps directory..."
    mkdir -p "$LOCAL_APPS_DIR"
fi

# Step 2: Create symlink if it doesn't exist
LINK_PATH="$LOCAL_APPS_DIR/$APP_NAME"
if [ ! -L "$LINK_PATH" ]; then
    echo "Creating symlink to local app..."
    ln -s "$SCRIPT_DIR" "$LINK_PATH"
    echo "✓ Linked $SCRIPT_DIR to $LINK_PATH"
else
    echo "✓ Symlink already exists"
fi

# Step 3: Build the app
echo ""
echo "Building app..."
npm run build:dev

# Step 4: Kill any running nRF Connect instances
echo ""
echo "Closing any running nRF Connect for Desktop instances..."
pkill -f "nrfconnect" || true
sleep 2

# Step 5: Run tests
echo ""
echo "Running E2E tests..."
echo "nRF Connect for Desktop will launch with your local app"
echo ""

export NRFCONNECT_APP_PATH="${NRFCONNECT_APP_PATH:-/home/arbl/apps/nrfconnect.AppImage}"
export DISPLAY="${DISPLAY:-:0}"

npm run test:e2e

echo ""
echo "=== Tests Complete ==="
echo ""
echo "Note: Your local app is now available in nRF Connect for Desktop"
echo "Location: $LINK_PATH -> $SCRIPT_DIR"
