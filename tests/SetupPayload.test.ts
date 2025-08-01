/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from 'fs';
import path from 'path';

import { CommissioningFlow, SetupPayload } from '../src/common/SetupPayload';

describe('SetupPayload', () => {
    describe('QR Code Generation and Parsing', () => {
        it('should generate and parse QR codes correctly', () => {
            const payload = new SetupPayload(
                3840,
                20202021,
                2,
                CommissioningFlow.Standard,
                65521,
                32774
            );
            const qrCode = payload.generateQRCode();

            expect(qrCode).toMatch(/^MT:[0-9A-Z\-.]+$/);

            const parsedPayload = SetupPayload.parseQRCode(qrCode);
            expect(parsedPayload?.longDiscriminator).toBe(3840);
            expect(parsedPayload?.pincode).toBe(20202021);
            expect(parsedPayload?.vid).toBe(65521);
            expect(parsedPayload?.pid).toBe(32774);
        });
    });

    describe('Manual Code Generation and Parsing', () => {
        it('should generate and parse manual codes correctly', () => {
            const payload = new SetupPayload(
                3840,
                20202021,
                2,
                CommissioningFlow.Standard,
                65521,
                32774
            );
            const manualCode = payload.generateManualCode();

            expect(manualCode).toMatch(/^\d{11}$/);

            const parsedPayload = SetupPayload.parseManualCode(manualCode);
            expect(parsedPayload?.shortDiscriminator).toBe(15); // 3840 >> 8 = 15
            expect(parsedPayload?.pincode).toBe(20202021);
        });
    });

    describe('fromLogs functionality', () => {
        it('should parse setup payload from device logs', () => {
            const logs = `
[00:00:01.234] Setup Discriminator: 3840
[00:00:01.235] Setup Pin Code: 20202021
[00:00:01.236] Vendor Id: 65521
[00:00:01.237] Product Id: 32774
            `;

            const payload = SetupPayload.fromLogs(logs);
            expect(payload.longDiscriminator).toBe(3840);
            expect(payload.pincode).toBe(20202021);
            expect(payload.vid).toBe(65521);
            expect(payload.pid).toBe(32774);
        });

        it('should throw error for invalid logs', () => {
            const logs = 'Invalid log content without required fields';

            expect(() => SetupPayload.fromLogs(logs)).toThrow(
                'Could not parse discriminator from logs'
            );
        });
    });

    describe('fromJSON functionality', () => {
        it('should parse setup payload from JSON file', async () => {
            // Create a mock JSON file path (this would need actual file in real test)
            const mockJsonPath = path.join(
                __dirname,
                'mocks',
                'factory_data.json'
            );

            // Create mock factory data
            const factoryData = {
                discriminator: 3010,
                passcode: 118502,
                vendor_id: 4759,
                product_id: 784,
            };

            // Mock fs.readFile
            const originalReadFile = fs.promises.readFile;
            fs.promises.readFile = jest
                .fn()
                .mockResolvedValue(JSON.stringify(factoryData));

            try {
                const payload = await SetupPayload.fromJSON(mockJsonPath);
                expect(payload.longDiscriminator).toBe(3010);
                expect(payload.pincode).toBe(118502);
                expect(payload.vid).toBe(4759);
                expect(payload.pid).toBe(784);
            } finally {
                fs.promises.readFile = originalReadFile;
            }
        });
    });

    describe('fromCBORHex functionality', () => {
        it('should parse setup payload from CBOR hex file', async () => {
            const mockHexPath = path.join(
                __dirname,
                'mocks',
                'factory_data.hex'
            );

            // Create simple mock Intel HEX content
            const mockHexContent = `:020000040000FA
:10000000A563646973637269B919BCE668706173734F
:1000100063B919CEE66776656E646F725F696419124F
:100020007F70726F647563745F696419031000000016
:00000001FF`;

            // Mock fs.readFile
            const originalReadFile = fs.promises.readFile;
            fs.promises.readFile = jest.fn().mockResolvedValue(mockHexContent);

            // Mock the decodeCBOR method directly to avoid complex CBOR encoding
            const originalDecodeCBOR = (SetupPayload as any).decodeCBOR;
            (SetupPayload as any).decodeCBOR = jest.fn().mockReturnValue({
                discriminator: 3010,
                passcode: 118502,
                vendor_id: 4759,
                product_id: 784,
            });

            try {
                const payload = await SetupPayload.fromCBORHex(mockHexPath);
                expect(payload.longDiscriminator).toBe(3010);
                expect(payload.pincode).toBe(118502);
                expect(payload.vid).toBe(4759);
                expect(payload.pid).toBe(784);

                // Verify we can generate QR codes from the parsed data
                const qrCode = payload.generateQRCode();
                expect(qrCode).toMatch(/^MT:[0-9A-Z\-.]+$/);
            } finally {
                fs.promises.readFile = originalReadFile;
                (SetupPayload as any).decodeCBOR = originalDecodeCBOR;
            }
        });

        it('should handle CBOR parsing errors gracefully', async () => {
            const mockHexPath = path.join(
                __dirname,
                'mocks',
                'invalid_factory_data.hex'
            );

            // Mock fs.readFile to return invalid hex content
            const originalReadFile = fs.promises.readFile;
            fs.promises.readFile = jest
                .fn()
                .mockResolvedValue(':invalid_hex_content');

            try {
                await expect(
                    SetupPayload.fromCBORHex(mockHexPath)
                ).rejects.toThrow();
            } finally {
                fs.promises.readFile = originalReadFile;
            }
        });
    });

    describe('Intel HEX parsing', () => {
        it('should parse Intel HEX format correctly', () => {
            const hexContent = `:10200000B46776657273696F6E0162736E543131B5
:10201000323233333434353536367373838393968
:00000001FF`;

            // Access private method for testing (this is a test-specific approach)
            const parseIntelHex = (SetupPayload as any).parseIntelHex;
            const binaryData = parseIntelHex(hexContent);

            expect(binaryData).toBeInstanceOf(Uint8Array);
            expect(binaryData.length).toBeGreaterThan(0);
        });
    });

    describe('Pretty printing', () => {
        it('should format setup information correctly', () => {
            const payload = new SetupPayload(
                3840,
                20202021,
                2,
                CommissioningFlow.Standard,
                65521,
                32774
            );
            const prettyString = payload.prettyPrint();

            expect(prettyString).toContain(
                'Flow                    : Standard'
            );
            expect(prettyString).toContain(
                'Pincode                 : 20202021'
            );
            expect(prettyString).toContain('Short Discriminator     : 15');
            expect(prettyString).toContain('Long Discriminator      : 3840');
            expect(prettyString).toContain('Vendor Id               : 65521');
            expect(prettyString).toContain('Product Id              : 32774');
        });
    });
});
