/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

import { TempFileManager } from '../src/common/TempFileManager';

// Mock console methods to reduce test output noise
const originalConsoleDebug = console.debug;
beforeAll(() => {
    console.debug = jest.fn();
});
afterAll(() => {
    console.debug = originalConsoleDebug;
});

describe('TempFileManager', () => {
    let tempFileManager: TempFileManager;

    beforeEach(() => {
        // Create instance without cleanup handlers for testing
        tempFileManager = new TempFileManager(false);
    });

    afterEach(async () => {
        // Clean up any files created during testing
        await tempFileManager.cleanupAllFiles();
    });

    it('should create unique temporary file paths', () => {
        const path1 = tempFileManager.createTempFilePath();
        const path2 = tempFileManager.createTempFilePath();

        expect(path1).toBeDefined();
        expect(path2).toBeDefined();
        expect(path1).not.toBe(path2);
        expect(path1).toMatch(/matter-qr-\d+-\d+\.png$/);
    });

    it('should track created temporary files', () => {
        const path1 = tempFileManager.createTempFilePath();
        const path2 = tempFileManager.createTempFilePath();

        expect(tempFileManager.getTrackedFileCount()).toBe(2);
        expect(tempFileManager.getTrackedFiles()).toContain(path1);
        expect(tempFileManager.getTrackedFiles()).toContain(path2);
    });

    it('should remove tracked files', async () => {
        const testFile = path.join(os.tmpdir(), 'test-matter-qr.png');
        await fs.writeFile(testFile, 'test content');

        tempFileManager.registerTempFile(testFile);
        expect(tempFileManager.getTrackedFileCount()).toBe(1);

        await tempFileManager.removeTempFile(testFile);
        expect(tempFileManager.getTrackedFileCount()).toBe(0);

        // File should not exist
        try {
            await fs.access(testFile);
            fail('File should have been deleted');
        } catch (error) {
            // Expected - file should not exist
        }
    });

    it('should clean up all tracked files', async () => {
        const testFile1 = path.join(os.tmpdir(), 'test-matter-qr-1.png');
        const testFile2 = path.join(os.tmpdir(), 'test-matter-qr-2.png');

        await fs.writeFile(testFile1, 'content1');
        await fs.writeFile(testFile2, 'content2');

        tempFileManager.registerTempFile(testFile1);
        tempFileManager.registerTempFile(testFile2);

        expect(tempFileManager.getTrackedFileCount()).toBe(2);

        await tempFileManager.cleanupAllFiles();

        expect(tempFileManager.getTrackedFileCount()).toBe(0);
    });

    it('should handle non-existent files gracefully', async () => {
        const nonExistentFile = path.join(os.tmpdir(), 'non-existent.png');

        tempFileManager.registerTempFile(nonExistentFile);
        expect(tempFileManager.getTrackedFileCount()).toBe(1);

        // Should not throw error
        await tempFileManager.removeTempFile(nonExistentFile);
        expect(tempFileManager.getTrackedFileCount()).toBe(0);
    });
});
