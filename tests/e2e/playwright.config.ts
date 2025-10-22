/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing of nRF Connect for Desktop Matter Quick Start app
 * This config is designed to work with the packaged Electron application on Windows and Linux
 */
export default defineConfig({
    testDir: './',
    
    // Increase timeout for hardware enumeration
    timeout: 120000, // 2 minutes per test
    
    // Expect assertions timeout
    expect: {
        timeout: 10000, // 10 seconds for assertions
    },
    
    fullyParallel: false, // Run tests sequentially for hardware testing
    
    forbidOnly: !!process.env.CI, // Fail in CI if test.only is accidentally left in
    
    retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
    
    workers: 1, // Single worker for hardware tests
    
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list'], // Console output
    ],
    
    use: {
        // Screenshot and trace on failure
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        
        // Video on failure
        video: 'retain-on-failure',
        
        // Action timeout
        actionTimeout: 30000, // 30 seconds for actions like click
    },
    
    projects: [
        {
            name: 'electron',
            use: {
                ...devices['Desktop Chrome'],
                // Electron-specific settings will be handled in the test setup
            },
        },
    ],
    
    // Output directory for test artifacts
    outputDir: 'test-results',
});

