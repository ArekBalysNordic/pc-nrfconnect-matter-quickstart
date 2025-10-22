/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Page, Locator } from 'playwright';

export interface DeviceInfo {
    serialNumber: string;
    deviceName: string;
    family: string;
    customName: string;
    isDisabled: boolean;
    disabledReason?: string;
}

/**
 * Wait for the device selection screen to be visible
 */
export async function waitForDeviceSelection(page: Page, timeout = 30000): Promise<void> {
    // Wait for either "Select a kit" heading (when devices are detected)
    // or stay on "Detect" screen if no devices yet
    try {
        await page.waitForSelector('text=Select a kit', { timeout });
    } catch {
        // If we don't see "Select a kit", we might still be on "Detect"
        const detectHeading = await page.locator('text=Detect').isVisible();
        if (!detectHeading) {
            throw new Error('Neither "Select a kit" nor "Detect" screen found');
        }
    }
}

/**
 * Check if we're still on the device detection screen (waiting for devices)
 */
export async function isOnDetectScreen(page: Page): Promise<boolean> {
    const detectHeading = await page.locator('h2:has-text("Detect")').isVisible({ timeout: 1000 }).catch(() => false);
    return detectHeading;
}

/**
 * Get all visible devices from the device selection list
 */
export async function getVisibleDevices(page: Page): Promise<DeviceInfo[]> {
    // First check if we're on the selection screen
    const hasSelectHeading = await page.locator('text=Select a kit').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!hasSelectHeading) {
        // Still on detect screen, no devices yet
        return [];
    }
    
    const devices: DeviceInfo[] = [];
    
    // Find all device list items
    // The RadioSelect component renders items, each containing device information
    // Looking for the structure: Family, Device name, Serial number, Custom name
    const deviceItems = page.locator('[class*="tw-flex"][class*="tw-flex-row"][class*="tw-items-center"][class*="tw-justify-start"]')
        .filter({ has: page.locator('p b') }); // Items with bold device names
    
    const count = await deviceItems.count();
    
    for (let i = 0; i < count; i++) {
        const item = deviceItems.nth(i);
        
        // Extract device information from the layout
        // Structure: [Icon/Family] [Device Name] [Serial Number] [Custom Name]
        const textElements = await item.locator('p').allTextContents();
        
        if (textElements.length >= 2) {
            const deviceName = textElements[0] || '';
            const serialNumber = textElements[1] || '';
            const customName = textElements[2] || '';
            
            // Check if disabled by looking for parent container with disabled styling
            const parentContainer = item.locator('xpath=ancestor::*[contains(@class, "tw-opacity")]').first();
            const isDisabled = await parentContainer.count() > 0;
            
            // Look for "Not supported yet." text to confirm disabled state
            let disabledReason = '';
            if (isDisabled) {
                const notSupportedText = await page.locator('text=Not supported yet.').isVisible({ timeout: 500 }).catch(() => false);
                if (notSupportedText) {
                    disabledReason = 'Not supported yet.';
                }
            }
            
            // Get family name from icon or first column
            let family = '';
            const familyText = await item.locator('svg').first().getAttribute('data-device') || '';
            family = familyText;
            
            devices.push({
                serialNumber: serialNumber.trim(),
                deviceName: deviceName.trim(),
                family,
                customName: customName.trim(),
                isDisabled,
                disabledReason,
            });
        }
    }
    
    return devices;
}

/**
 * Get all devices including their disabled state
 * Returns more detailed information by checking actual DOM structure
 */
export async function getAllDevicesDetailed(page: Page): Promise<DeviceInfo[]> {
    const hasSelectHeading = await page.locator('text=Select a kit').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!hasSelectHeading) {
        return [];
    }
    
    const devices: DeviceInfo[] = [];
    
    // More robust selector for device items in the list
    // RadioSelect renders items in a specific structure
    const listItems = page.locator('div[role="button"], div[class*="tw-cursor-pointer"]')
        .filter({ has: page.locator('p:has(b)') });
    
    const count = await listItems.count();
    
    for (let i = 0; i < count; i++) {
        const item = listItems.nth(i);
        
        // Check if the item is disabled (has opacity or disabled text)
        const hasDisabledText = await item.locator('text=Not supported yet.').isVisible({ timeout: 100 }).catch(() => false);
        const opacity = await item.getAttribute('class') || '';
        const isDisabled = hasDisabledText || opacity.includes('opacity-50');
        
        // Extract text content
        const allText = await item.locator('p').allTextContents();
        
        const deviceName = allText[0]?.replace(/\*/g, '').trim() || '';
        const serialNumber = allText[1]?.trim() || '';
        const customName = allText[2]?.trim() || '';
        
        devices.push({
            serialNumber,
            deviceName,
            family: '', // Can be extracted from icon if needed
            customName,
            isDisabled,
            disabledReason: hasDisabledText ? 'Not supported yet.' : undefined,
        });
    }
    
    return devices;
}

/**
 * Find the Continue button
 */
export async function getContinueButton(page: Page): Promise<Locator> {
    // The Continue button is rendered by the Next component
    // It's a primary button with text "Continue"
    return page.locator('button:has-text("Continue")');
}

/**
 * Check if the Continue button is enabled
 */
export async function isContinueButtonEnabled(page: Page): Promise<boolean> {
    const button = await getContinueButton(page);
    const isDisabled = await button.getAttribute('disabled');
    return isDisabled === null;
}

/**
 * Click the Continue button
 */
export async function clickContinue(page: Page): Promise<void> {
    const button = await getContinueButton(page);
    await button.waitFor({ state: 'visible' });
    await button.click();
}

/**
 * Wait for devices to be detected
 * @param page The Playwright page
 * @param minDevices Minimum number of devices expected
 * @param timeout Maximum time to wait in milliseconds
 */
export async function waitForDevices(
    page: Page,
    minDevices = 1,
    timeout = 30000
): Promise<DeviceInfo[]> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
        // Check if we're still on detect screen
        const onDetect = await isOnDetectScreen(page);
        
        if (!onDetect) {
            // We've moved to selection screen, get devices
            const devices = await getAllDevicesDetailed(page);
            
            if (devices.length >= minDevices) {
                return devices;
            }
        }
        
        // Wait a bit before checking again
        await page.waitForTimeout(1000);
    }
    
    // Timeout reached
    const devices = await getAllDevicesDetailed(page);
    if (devices.length < minDevices) {
        throw new Error(`Timeout waiting for ${minDevices} device(s). Found: ${devices.length}`);
    }
    
    return devices;
}

