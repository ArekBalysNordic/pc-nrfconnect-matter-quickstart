/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { test, expect } from '@playwright/test';
import { launchApp, closeApp, AppContext } from './helpers/appLauncher';
import {
    waitForDevices,
    isContinueButtonEnabled,
    clickContinue,
    isOnDetectScreen,
} from './helpers/deviceHelpers';

let appContext: AppContext;

test.describe('Matter Quick Start - Device Detection', () => {
    test.beforeAll(async () => {
        // Launch the app once for all tests
        appContext = await launchApp();
    });

    test.afterAll(async () => {
        // Close the app after all tests
        if (appContext) {
            await closeApp(appContext);
        }
    });

    test('should detect devices and enable Continue button', async () => {
        const { page } = appContext;
        
        console.log('Starting device detection test...');
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'test-results/01-initial-screen.png',
            fullPage: true,
        });
        
        // Wait 30 seconds for device enumeration
        console.log('Waiting 30 seconds for device enumeration...');
        await page.waitForTimeout(30000);
        
        // Take screenshot after waiting
        await page.screenshot({ 
            path: 'test-results/02-after-30s-wait.png',
            fullPage: true,
        });
        
        // Check if we're still on detect screen or moved to selection
        const stillDetecting = await isOnDetectScreen(page);
        
        if (stillDetecting) {
            console.log('Still on detect screen - no devices found yet');
            await page.screenshot({ 
                path: 'test-results/03-still-detecting.png',
                fullPage: true,
            });
            
            // This is a failure case - no devices detected
            throw new Error(
                'No devices detected after 30 seconds. Ensure development kits are connected and powered on.'
            );
        }
        
        console.log('Devices detected, on selection screen');
        
        // Get all visible devices
        const devices = await waitForDevices(page, 1, 5000);
        
        console.log(`Found ${devices.length} device(s):`);
        devices.forEach((device, index) => {
            console.log(`  ${index + 1}. ${device.deviceName} (${device.serialNumber})`);
            console.log(`     Disabled: ${device.isDisabled}${device.disabledReason ? ` - ${device.disabledReason}` : ''}`);
        });
        
        // Take screenshot showing device list
        await page.screenshot({ 
            path: 'test-results/03-device-list.png',
            fullPage: true,
        });
        
        // Verify at least one device is visible
        expect(devices.length).toBeGreaterThan(0);
        
        // Verify all devices are not disabled
        const disabledDevices = devices.filter(d => d.isDisabled);
        
        if (disabledDevices.length > 0) {
            console.log(`Warning: ${disabledDevices.length} disabled device(s) found:`);
            disabledDevices.forEach(device => {
                console.log(`  - ${device.deviceName}: ${device.disabledReason || 'Unknown reason'}`);
            });
        }
        
        // Check that at least one device is enabled (not all are disabled)
        const enabledDevices = devices.filter(d => !d.isDisabled);
        expect(enabledDevices.length).toBeGreaterThan(0);
        
        // Verify Continue button state
        const continueEnabled = await isContinueButtonEnabled(page);
        console.log(`Continue button enabled: ${continueEnabled}`);
        
        // The Continue button should be enabled if a device is selected
        // (or disabled if no device is selected yet)
        // Let's check if we can see the button
        const continueButton = page.locator('button:has-text("Continue")');
        await expect(continueButton).toBeVisible();
        
        // If there are enabled devices, the user should be able to select one
        // For automation, let's click the first enabled device if Continue is disabled
        if (!continueEnabled && enabledDevices.length > 0) {
            console.log('Continue is disabled, selecting first enabled device...');
            
            // Find and click the first enabled device in the list
            // Devices are rendered as clickable items
            const deviceItems = page.locator('div[role="button"], div[class*="tw-cursor-pointer"]')
                .filter({ has: page.locator('p:has(b)') });
            
            // Click first non-disabled item
            for (let i = 0; i < await deviceItems.count(); i++) {
                const item = deviceItems.nth(i);
                const hasDisabledText = await item.locator('text=Not supported yet.')
                    .isVisible({ timeout: 100 })
                    .catch(() => false);
                
                if (!hasDisabledText) {
                    await item.click();
                    console.log('Selected first enabled device');
                    await page.waitForTimeout(500); // Wait for selection to register
                    break;
                }
            }
            
            // Take screenshot after selection
            await page.screenshot({ 
                path: 'test-results/04-device-selected.png',
                fullPage: true,
            });
        }
        
        // Now Continue button should be enabled
        await expect(continueButton).toBeEnabled({ timeout: 5000 });
        
        // Click Continue button
        console.log('Clicking Continue button...');
        await clickContinue(page);
        
        // Wait for navigation to next screen
        await page.waitForTimeout(2000);
        
        // Take screenshot of next screen
        await page.screenshot({ 
            path: 'test-results/05-next-screen.png',
            fullPage: true,
        });
        
        console.log('Successfully clicked Continue and navigated forward');
        
        // Verify we've moved to a different screen
        // The "Select a kit" heading should no longer be visible
        const selectHeading = await page.locator('text=Select a kit')
            .isVisible({ timeout: 2000 })
            .catch(() => true);
        
        expect(selectHeading).toBe(false);
        
        console.log('Test completed successfully!');
    });
});

