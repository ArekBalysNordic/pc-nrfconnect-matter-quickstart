# E2E Testing for Matter Quick Start

This directory contains end-to-end tests for the Matter Quick Start application using Playwright.

## Overview

These tests verify the application's functionality with real hardware (development kits) by automating user interactions with the packaged nRF Connect for Desktop application.

## Prerequisites

### Hardware Requirements
- At least one Nordic Semiconductor development kit must be connected via USB
- Supported devices: nRF52840, nRF5340, nRF54L15, nRF54LM20, or Thingy:53
- Device must be powered on and properly recognized by the system

### Software Requirements
- Node.js (version matching project requirements)
- nRF Connect for Desktop installed
- Development kits with appropriate USB drivers installed

### Linux-Specific Requirements
- USB device permissions (udev rules for Nordic devices)
- Display server (X11) running, or Xvfb for headless testing
- Set `DISPLAY` environment variable if needed

### Windows-Specific Requirements
- Development kits drivers installed (nRF Connect for Desktop installs these)

## Installation

Install test dependencies:

```bash
npm install
```

This will install Playwright and related dependencies as specified in `package.json`.

## Running Tests Locally

### Testing Local Development Build (Recommended for Development)

**Important:** Matter Quick Start is an nRF Connect for Desktop plugin app, not a standalone Electron app. To test local changes, you need to install your development version in nRF Connect for Desktop.

#### Step 1: Link Your Local App to nRF Connect for Desktop

```bash
# Create local apps directory if it doesn't exist
mkdir -p ~/.nrfconnect-apps/local

# Link your local development version
cd ~/.nrfconnect-apps/local
ln -s /home/arbl/matter/pc-nrfconnect-quickstart-for-matter matter-quickstart

# Build your app
cd /home/arbl/matter/pc-nrfconnect-quickstart-for-matter
npm run build:dev
```

#### Step 2: Open nRF Connect for Desktop

- Launch nRF Connect for Desktop manually
- Your local "Matter Quick Start" app should appear in the list
- If not, restart nRF Connect for Desktop

#### Step 3: Run E2E Tests

Now the tests will use your local development version:

```bash
# Make sure nRF Connect for Desktop is closed
# Run tests
npm run test:e2e
```

#### Workflow for Testing Local Changes

```bash
# 1. Make your code changes
# 2. Build
npm run build:dev

# 3. Close nRF Connect for Desktop if it's running
pkill -f nrfconnect

# 4. Run tests (will launch nRF Connect with your local app)
npm run test:e2e
```

### Testing Production/Installed Build

To test the installed nRF Connect for Desktop app:

```bash
npm run test:e2e
```

### With Custom App Path

If nRF Connect for Desktop is installed in a non-standard location:

```bash
export NRFCONNECT_APP_PATH="/path/to/nRF Connect for Desktop"
npm run test:e2e
```

On Windows (PowerShell):
```powershell
$env:NRFCONNECT_APP_PATH="C:\Custom\Path\nRF Connect for Desktop.exe"
npm run test:e2e
```

### Viewing Test Results

After tests run, view the HTML report:

```bash
npx playwright show-report playwright-report
```

## Test Structure

### Main Test: Device Detection

**File:** `device-detection.spec.ts`

**Test Steps:**
1. Launch nRF Connect for Desktop with Matter Quick Start app
2. Wait 30 seconds for device enumeration
3. Verify devices are detected and visible
4. Verify at least one device is enabled (not disabled)
5. Select an enabled device
6. Click Continue button
7. Verify navigation to next screen

**Expected Behavior:**
- At least one device should be detected within 30 seconds
- Device list should show device name, serial number, and family
- Continue button should be enabled after device selection
- Application should navigate to next step after clicking Continue

## Configuration

### Environment Variables

- `USE_LOCAL_APP`: Set to `true` or `1` to test the local development build instead of installed app
  - Example: `USE_LOCAL_APP=true npm run test:e2e`
  - Automatically set by `npm run test:e2e:local`

- `NRFCONNECT_APP_PATH`: Full path to nRF Connect for Desktop executable (production mode only)
  - Windows default: `%LOCALAPPDATA%\Programs\nrfconnect\nRF Connect for Desktop.exe`
  - Linux defaults: `/opt/nrfconnect/nrfconnect` or `~/.local/share/nrfconnect/nrfconnect`

### Timeouts

Configured in `playwright.config.ts`:
- Test timeout: 120 seconds (2 minutes)
- Action timeout: 30 seconds
- Expect timeout: 10 seconds

## Jenkins Integration

### Jenkins Pipeline Setup

#### Prerequisites
1. Jenkins agent with USB access to development kits
2. Node.js installed on Jenkins agent
3. nRF Connect for Desktop installed on Jenkins agent
4. USB permissions configured (Linux)
5. Display server available (Linux - use Xvfb if headless)

#### Pipeline Configuration

```groovy
pipeline {
    agent {
        label 'hardware-testing' // Agent with DKs connected
    }
    
    environment {
        NRFCONNECT_APP_PATH = "${env.WORKSPACE}/nrfconnect" // Adjust as needed
        DISPLAY = ':99' // For Linux with Xvfb
    }
    
    stages {
        stage('Setup') {
            steps {
                // Start Xvfb for headless testing on Linux
                sh '''
                    if [ "$(uname)" = "Linux" ]; then
                        Xvfb :99 -screen 0 1280x1024x24 &
                        export DISPLAY=:99
                    fi
                '''
                
                // Install dependencies
                sh 'npm install'
            }
        }
        
        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e:ci'
            }
        }
    }
    
    post {
        always {
            // Archive test results
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            
            // Publish JUnit test results
            junit 'test-results/junit.xml'
            
            // Publish HTML report
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'E2E Test Report',
                keepAll: true
            ])
        }
        
        failure {
            // Send notifications on failure
            emailext(
                subject: "E2E Tests Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "E2E tests failed. Check the build at ${env.BUILD_URL}",
                to: 'team@example.com'
            )
        }
    }
}
```

### Multi-Platform Jenkins Setup

For testing on both Windows and Linux:

```groovy
pipeline {
    agent none
    
    stages {
        stage('E2E Tests') {
            parallel {
                stage('Windows') {
                    agent { label 'windows-hardware' }
                    steps {
                        bat 'npm install'
                        bat 'npm run test:e2e:ci'
                    }
                }
                
                stage('Linux') {
                    agent { label 'linux-hardware' }
                    environment {
                        DISPLAY = ':99'
                    }
                    steps {
                        sh 'Xvfb :99 -screen 0 1280x1024x24 &'
                        sh 'npm install'
                        sh 'npm run test:e2e:ci'
                    }
                }
            }
        }
    }
}
```

## Troubleshooting

### No Devices Detected

**Symptoms:** Test fails with "No devices detected after 30 seconds"

**Solutions:**
1. Verify DK is connected and powered on
2. Check USB cable and connection
3. Verify DK appears in device manager (Windows) or `lsusb` (Linux)
4. Check USB permissions (Linux: udev rules)
5. Restart nRF Connect for Desktop

### App Launch Fails

**Symptoms:** Test fails during app launch

**Solutions:**
1. Verify `NRFCONNECT_APP_PATH` is correct
2. Check nRF Connect for Desktop is installed
3. Try launching app manually first
4. Check permissions on app executable

### Display Issues (Linux)

**Symptoms:** "Cannot open display" error

**Solutions:**
1. Set `DISPLAY` environment variable: `export DISPLAY=:0`
2. Use Xvfb for headless: `Xvfb :99 -screen 0 1280x1024x24 &`
3. Grant X11 access if needed: `xhost +local:`

### Timeout Issues

**Symptoms:** Tests timeout during execution

**Solutions:**
1. Increase timeouts in `playwright.config.ts`
2. Check system performance (CPU, memory)
3. Verify no other apps are using the DKs
4. Check for antivirus interference

### Button Not Enabled

**Symptoms:** Continue button not enabled after device selection

**Solutions:**
1. Verify device is supported (not showing "Not supported yet")
2. Check device selection logic in test
3. Verify app UI has loaded completely
4. Take screenshots to debug state

## Test Artifacts

Tests generate several artifacts for debugging:

- `test-results/`: Screenshots, videos, traces
  - `01-initial-screen.png`: App initial state
  - `02-after-30s-wait.png`: After device enumeration wait
  - `03-device-list.png`: Device selection screen
  - `04-device-selected.png`: After device selection
  - `05-next-screen.png`: After clicking Continue
- `playwright-report/`: HTML test report
- `test-results/junit.xml`: JUnit format results for CI
- `test-results/results.json`: JSON format results

## Adding More Tests

To add additional test scenarios:

1. Create new test file in `tests/e2e/`: `my-test.spec.ts`
2. Import helpers from `helpers/` directory
3. Use existing patterns from `device-detection.spec.ts`
4. Run tests: `npm run test:e2e`

Example:

```typescript
import { test, expect } from '@playwright/test';
import { launchApp, closeApp } from './helpers/appLauncher';

test('my new test', async () => {
    const context = await launchApp();
    
    // Your test code here
    
    await closeApp(context);
});
```

## Support

For issues or questions:
- Check troubleshooting section above
- Review Playwright documentation: https://playwright.dev
- Contact development team
- File issue in project repository

