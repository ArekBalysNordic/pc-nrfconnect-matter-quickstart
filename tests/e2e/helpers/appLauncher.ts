/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Check if we should run in local development mode
 * Set USE_LOCAL_APP=true to test the local development build
 */
function useLocalApp(): boolean {
    return process.env.USE_LOCAL_APP === 'true' || process.env.USE_LOCAL_APP === '1';
}

/**
 * Get the path to the nRF Connect for Desktop executable (production mode)
 * Priority:
 * 1. NRFCONNECT_APP_PATH environment variable
 * 2. Platform-specific default paths
 */
function getAppPath(): string {
    // Check environment variable first
    if (process.env.NRFCONNECT_APP_PATH) {
        return process.env.NRFCONNECT_APP_PATH;
    }

    // Platform-specific default paths
    const platform = process.platform;
    
    if (platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
        const possiblePaths = [
            path.join(localAppData, 'Programs', 'nrfconnect', 'nRF Connect for Desktop.exe'),
            path.join('C:', 'Program Files', 'nrfconnect', 'nRF Connect for Desktop.exe'),
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
        
        throw new Error(
            'nRF Connect for Desktop not found. Set NRFCONNECT_APP_PATH environment variable or install to default location.'
        );
    } else if (platform === 'linux') {
        const home = process.env.HOME || '';
        const possiblePaths = [
            '/opt/nrfconnect/nrfconnect',
            path.join(home, '.local', 'share', 'nrfconnect', 'nrfconnect'),
            '/usr/local/bin/nrfconnect',
        ];
        
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }
        
        throw new Error(
            'nRF Connect for Desktop not found. Set NRFCONNECT_APP_PATH environment variable or install to default location.'
        );
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
}

export interface AppContext {
    app: ElectronApplication;
    page: Page;
}

/**
 * Launch the local development version of Matter Quick Start app
 * NOTE: nRF Connect apps are plugins that require the launcher framework.
 * This function is experimental and may not work reliably.
 * For testing local changes, install the app in nRF Connect for Desktop:
 *   1. Build: npm run build:dev
 *   2. Link: cd ~/.nrfconnect-apps/local && ln -s /path/to/this/repo matter-quickstart
 *   3. Restart nRF Connect for Desktop
 *   4. Use production mode testing
 */
async function launchLocalApp(): Promise<AppContext> {
    throw new Error(
        'Local app mode is not supported for nRF Connect Desktop apps.\n' +
        'These apps require the launcher framework to function.\n\n' +
        'To test local changes:\n' +
        '  1. Build your app: npm run build:dev\n' +
        '  2. Install it in nRF Connect for Desktop (see docs)\n' +
        '  3. Use production mode: npm run test:e2e\n\n' +
        'Or use the workaround described in tests/e2e/README.md'
    );
}

/**
 * Get the active page, handling window transitions
 */
async function getActivePage(app: ElectronApplication): Promise<Page> {
    const windows = app.windows();
    console.log(`Found ${windows.length} window(s)`);
    
    // Find a window that's not closed
    for (const window of windows) {
        if (!window.isClosed()) {
            return window;
        }
    }
    
    // If all windows are closed, wait for a new one
    console.log('All windows closed, waiting for new window...');
    return await app.waitForEvent('window', { timeout: 30000 });
}

/**
 * Launch nRF Connect for Desktop with the Matter Quick Start app (production mode)
 */
async function launchProductionApp(): Promise<AppContext> {
    const appPath = getAppPath();
    
    console.log(`Launching nRF Connect for Desktop from: ${appPath}`);
    
    // Launch the Electron app
    const app = await electron.launch({
        executablePath: appPath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
        ],
        env: {
            ...process.env,
            NODE_ENV: 'production',
        },
        timeout: 60000, // 60 seconds to launch
    });
    
    console.log('App process launched, waiting for window...');
    
    // Wait a bit for the app to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the active page (handles multiple windows)
    let page = await getActivePage(app);
    
    console.log('Window acquired, checking page state...');
    
    // Wait for page to be ready, with error handling
    try {
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    } catch (error) {
        console.log('Page closed during load, getting new page...');
        page = await getActivePage(app);
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    }
    
    console.log('Page loaded, checking for launcher or app...');
    
    // Debug: Take screenshot and log page info
    const screenshotDir = path.resolve(process.cwd(), 'test-results');
    try {
        // Ensure directory exists
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const url = page.url();
        const title = await page.title();
        console.log(`Current page URL: ${url}`);
        console.log(`Current page title: ${title}`);
        
        // Take a debug screenshot
        const screenshotPath = path.join(screenshotDir, 'debug-initial-page.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to ${screenshotPath}`);
        
        // Log visible text (first 1000 chars)
        const bodyText = await page.locator('body').textContent();
        console.log(`Visible text (first 1000 chars): ${bodyText?.substring(0, 1000)}...`);
    } catch (error) {
        console.log('Error getting debug info:', error);
    }
    
    // Check if we're in the launcher or already in an app
    // The launcher has "launcher.html" in URL and app navigation elements
    let isLauncher = false;
    try {
        const url = page.url();
        // Check if it's the launcher page
        if (url.includes('launcher.html')) {
            console.log('Detected launcher page by URL');
            isLauncher = true;
        } else {
            // Also check for launcher-specific elements
            isLauncher = await page.locator('text=Update all apps').isVisible({ timeout: 2000 }).catch(() => false) ||
                         await page.locator('[class*="apps"]').first().isVisible({ timeout: 2000 }).catch(() => false);
        }
    } catch (error) {
        console.log('Error checking for launcher:', error);
    }
    
    if (isLauncher) {
        console.log('Launcher detected, looking for Matter Quick Start app...');
        
        try {
            // Take screenshot before searching
            const beforeSearchPath = path.join(screenshotDir, 'debug-before-search.png');
            await page.screenshot({ path: beforeSearchPath, fullPage: true });
            console.log(`Screenshot before search saved to ${beforeSearchPath}`);
            
            // Use the search box to filter apps
            console.log('Using search to filter for "Matter Quick Start"...');
            const searchBox = page.locator('input[placeholder*="Search"], input[type="text"]').first();
            await searchBox.fill('Matter Quick Start');
            console.log('Typed "Matter Quick Start" in search box');
            
            // Wait for filter to apply
            await page.waitForTimeout(1000);
            
            // Take screenshot after search
            const afterSearchPath = path.join(screenshotDir, 'debug-after-search.png');
            await page.screenshot({ path: afterSearchPath, fullPage: true });
            console.log(`Screenshot after search saved to ${afterSearchPath}`);
            
            // Now there should be fewer apps visible, find the Open button
            // Look for "Matter Quick Start" text (should be filtered now)
            const appCard = page.locator('text=Matter Quick Start').first();
            const found = await appCard.isVisible({ timeout: 3000 }).catch(() => false);
            
            if (!found) {
                // List all visible app names after filter
                console.log('Matter Quick Start not found after filtering. Visible content:');
                const allText = await page.locator('body').textContent();
                console.log(allText);
                throw new Error('Matter Quick Start app not found in launcher after search. Is your local app linked correctly?');
            }
            
            console.log('Found Matter Quick Start app after search');
            
            // Find the Open button - should be much easier now with filtered results
            const openButtons = page.locator('button:has-text("Open")');
            const buttonCount = await openButtons.count();
            console.log(`Found ${buttonCount} Open button(s) after filtering`);
            
            if (buttonCount === 0) {
                throw new Error('No Open buttons found after filtering');
            }
            
            // If there's only one Open button visible, click it
            // Otherwise, find the one in the same row as "Matter Quick Start"
            let openButton;
            if (buttonCount === 1) {
                console.log('Only one Open button found, clicking it');
                openButton = openButtons.first();
            } else {
                console.log('Multiple Open buttons found, finding correct one');
                // Find the button that's in the same row/container as "Matter Quick Start"
                // that does NOT contain "Cluster Editor"
                for (let i = 0; i < buttonCount; i++) {
                    const btn = openButtons.nth(i);
                    // Get text of the parent row
                    const row = btn.locator('xpath=ancestor::*[contains(@class, "app") or contains(@class, "row") or contains(@class, "card")]').first();
                    const rowText = await row.textContent().catch(() => '');
                    console.log(`Button ${i} row text: ${rowText?.substring(0, 100)}`);
                    
                    if (rowText.includes('Matter Quick Start') && 
                        !rowText.includes('Cluster Editor')) {
                        console.log(`Found correct Open button at index ${i}`);
                        openButton = btn;
                        break;
                    }
                }
                
                // Fallback: just click the first one if we couldn't determine
                if (!openButton) {
                    console.log('Could not determine correct button, clicking first one');
                    openButton = openButtons.first();
                }
            }
            
            console.log('Clicking Open button...');
            await openButton.click();
            
            // Wait for the app window to open
            console.log('Clicked on Matter Quick Start, waiting for new window...');
            
            // The app opens in a NEW window, we need to switch to it
            // Wait for the new window event
            const newPagePromise = app.waitForEvent('window', { timeout: 10000 });
            await new Promise(resolve => setTimeout(resolve, 2000)); // Give it time to start opening
            
            try {
                const newPage = await newPagePromise;
                console.log('New window detected!');
                await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 });
                page = newPage;
                
                const newUrl = page.url();
                console.log(`Switched to new window: ${newUrl}`);
            } catch (error) {
                console.log('No new window event, checking existing windows...');
                // Fallback: find the app window by URL
                const windows = app.windows();
                console.log(`Total windows: ${windows.length}`);
                
                for (const win of windows) {
                    if (!win.isClosed()) {
                        const url = win.url();
                        console.log(`Checking window: ${url}`);
                        // Look for the app window (contains index.html but not launcher.html)
                        if (url.includes('index.html') && !url.includes('launcher.html')) {
                            console.log('Found app window!');
                            page = win;
                            break;
                        }
                    }
                }
            }
            
            // Take screenshot after switching windows
            const afterClickPath = path.join(screenshotDir, 'debug-after-click.png');
            await page.screenshot({ path: afterClickPath, fullPage: true });
            console.log(`Screenshot after click saved to ${afterClickPath}`);
            console.log(`Current page URL: ${page.url()}`);
        } catch (error) {
            console.log('Error opening app from launcher:', error);
            throw error;
        }
    } else {
        console.log('Not on launcher - app already open or direct launch');
    }
    
    // Wait for the Matter Quick Start app UI to be ready
    console.log('Waiting for Matter Quick Start app UI...');
    
    // Give the app more time to initialize
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Debug: Take screenshot and examine page
    try {
        const afterWaitPath = path.join(screenshotDir, 'debug-app-opened.png');
        await page.screenshot({ path: afterWaitPath, fullPage: true });
        console.log(`Screenshot saved to ${afterWaitPath}`);
        
        const url = page.url();
        const title = await page.title();
        console.log(`App page - URL: ${url}`);
        console.log(`App page - Title: ${title}`);
        
        // Log all visible text
        const bodyText = await page.locator('body').textContent();
        console.log(`Visible text (first 2000 chars): ${bodyText?.substring(0, 2000)}`);
        
        // Log all visible headings
        const headings = await page.locator('h1, h2, h3, h4').allTextContents();
        console.log('Visible headings:', headings);
        
        // Check if still on launcher page
        if (url.includes('launcher.html')) {
            console.log('WARNING: Still on launcher page!');
            // Wait more and check again
            await new Promise(resolve => setTimeout(resolve, 5000));
            page = await getActivePage(app);
            const newUrl = page.url();
            console.log(`After additional wait - URL: ${newUrl}`);
            await page.screenshot({ path: path.join(screenshotDir, 'debug-after-additional-wait.png'), fullPage: true });
        }
    } catch (error) {
        console.log('Error taking debug screenshot:', error);
    }
    
    // Look for the Matter Quick Start app UI - try multiple selectors
    console.log('Looking for Matter Quick Start app UI elements...');
    
    const possibleSelectors = [
        'text=Detect',
        'text=Select a kit',
        'h2:has-text("Detect")',
        'h2:has-text("Select a kit")',
        '*:has-text("Connect a Nordic development kit")',
        '*:has-text("development kit")',
    ];
    
    let found = false;
    for (const selector of possibleSelectors) {
        try {
            const element = page.locator(selector).first();
            const visible = await element.isVisible({ timeout: 2000 });
            if (visible) {
                console.log(`Found app UI using selector: ${selector}`);
                found = true;
                break;
            }
        } catch (error) {
            // Try next selector
        }
    }
    
    if (!found) {
        // Take final debug screenshot
        const errorPath = path.join(screenshotDir, 'debug-error-state.png');
        await page.screenshot({ path: errorPath, fullPage: true });
        console.log(`Error screenshot saved to ${errorPath}`);
        console.log('Available text on page:');
        const allText = await page.locator('body').textContent();
        console.log(allText);
        
        // List all windows
        const windows = app.windows();
        console.log(`Total windows: ${windows.length}`);
        for (let i = 0; i < windows.length; i++) {
            const win = windows[i];
            if (!win.isClosed()) {
                const winUrl = win.url();
                console.log(`Window ${i}: ${winUrl}`);
            }
        }
        
        throw new Error(
            'Matter Quick Start app UI not found. ' +
            'Could not find "Detect" or "Select a kit" or device-related text. ' +
            `Check debug screenshots in ${screenshotDir}/`
        );
    }
    
    console.log('Matter Quick Start app is ready');
    
    return { app, page };
}

/**
 * Launch the Matter Quick Start app
 * Supports both local development and production modes
 * Set USE_LOCAL_APP=true to test the local development build
 * @returns Promise resolving to the Electron app and main page
 */
export async function launchApp(): Promise<AppContext> {
    if (useLocalApp()) {
        return launchLocalApp();
    } else {
        return launchProductionApp();
    }
}

/**
 * Close the app and cleanup
 */
export async function closeApp(context: AppContext): Promise<void> {
    await context.app.close();
}

