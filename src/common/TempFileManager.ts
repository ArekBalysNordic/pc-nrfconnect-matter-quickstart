/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import readline from 'readline';

/**
 * Centralized manager for temporary QR code files to ensure proper cleanup
 * even when the application is terminated unexpectedly.
 */
class TempFileManager {
    private tempFiles: Set<string> = new Set();
    private cleanupHandlersRegistered = false;
    private readonly tempFilePrefix = 'matter-qr-';
    private readonly tempFileExtension = '.png';

    constructor(registerHandlers = true) {
        if (registerHandlers) {
            this.registerCleanupHandlers();
        }
        this.cleanupExistingTempFiles();
    }

    /**
     * Register cleanup handlers for various application termination scenarios
     * @returns {void}
     */
    private registerCleanupHandlers(): void {
        if (this.cleanupHandlersRegistered) {
            return;
        }

        const cleanup = () => {
            this.cleanupAllFiles().catch(error => {
                console.error('Error during temp file cleanup:', error);
            });
        };

        // Handle graceful shutdown
        process.on('exit', cleanup);

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            cleanup();
            process.exit(0);
        });

        // Handle kill command
        process.on('SIGTERM', () => {
            cleanup();
            process.exit(0);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error(
                'Unhandled rejection at:',
                promise,
                'reason:',
                reason
            );
            cleanup();
            process.exit(1);
        });

        // Handle Windows specific close event
        if (process.platform === 'win32') {
            readline
                .createInterface({
                    input: process.stdin,
                    output: process.stdout,
                })
                .on('SIGINT', () => {
                    cleanup();
                    process.exit(0);
                });
        }

        this.cleanupHandlersRegistered = true;
    }

    /**
     * Clean up any existing temporary QR code files from previous sessions
     * @returns {void}
     */
    private async cleanupExistingTempFiles(): Promise<void> {
        try {
            const tempDir = os.tmpdir();
            const files = await fs.readdir(tempDir);

            const qrCodeFiles = files.filter(
                file =>
                    file.startsWith(this.tempFilePrefix) &&
                    file.endsWith(this.tempFileExtension)
            );

            await Promise.allSettled(
                qrCodeFiles.map(async file => {
                    try {
                        const filePath = path.join(tempDir, file);
                        await fs.unlink(filePath);
                        console.debug(
                            `Cleaned up existing temp file: ${filePath}`
                        );
                    } catch (error) {
                        // File might have been deleted already, ignore
                        console.debug(
                            `Could not cleanup existing temp file ${file}:`,
                            error
                        );
                    }
                })
            );
        } catch (error) {
            console.error('Error cleaning up existing temp files:', error);
        }
    }

    createTempFilePath(): string {
        const tempDir = os.tmpdir();
        // Add random component to ensure uniqueness even with same timestamp
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const filename = `${this.tempFilePrefix}${timestamp}-${random}.png`;
        const filePath = path.join(tempDir, filename);

        this.tempFiles.add(filePath);
        return filePath;
    }

    /**
     * Register an external temporary file path (for backward compatibility)
     * @param {string} filePath - The path to register
     * @returns {void}
     */
    registerTempFile(filePath: string): void {
        this.tempFiles.add(filePath);
    }

    /**
     * Remove a specific temporary file
     * @param {string} filePath - The path to remove
     * @returns {void}
     */
    async removeTempFile(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
            this.tempFiles.delete(filePath);
            console.debug(`Removed temp file: ${filePath}`);
        } catch (error) {
            console.debug(`Could not remove temp file ${filePath}:`, error);
            // Remove from tracking even if deletion failed
            this.tempFiles.delete(filePath);
        }
    }

    /**
     * Clean up all tracked temporary files
     * @returns {void}
     */
    async cleanupAllFiles(): Promise<void> {
        const filesToCleanup = Array.from(this.tempFiles);

        await Promise.allSettled(
            filesToCleanup.map(filePath => this.removeTempFile(filePath))
        );

        this.tempFiles.clear();
        console.debug('All temporary QR code files cleaned up');
    }

    getTrackedFiles(): string[] {
        return Array.from(this.tempFiles);
    }

    getTrackedFileCount(): number {
        return this.tempFiles.size;
    }
}

// Export the class for testing purposes
export { TempFileManager };

// Export a singleton instance
export const tempFileManager = new TempFileManager();

export default tempFileManager;
