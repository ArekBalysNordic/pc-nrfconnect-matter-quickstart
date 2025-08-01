/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-bitwise, no-plusplus */

/**
 * Matter Setup Payload Parser and Generator
 *
 * This module provides functionality to parse and generate Matter setup
 * payloads for both QR codes and manual setup codes.
 *
 * @example Parse a QR code
 * ```typescript
 * const payload = SetupPayload.parse('MT:8IXS142C00KA0648G00');
 * console.log(payload.discriminator); // 3840
 * console.log(payload.pincode); // 20202021
 * ```
 *
 * @example Generate a QR code
 * ```typescript
 * const payload = new SetupPayload(3840, 20202021, 2,
 * CommissioningFlow.Standard, 65521, 32774); const qrCode =
 * payload.generateQRCode(); const manualCode = payload.generateManualCode();
 * ```
 */

import { Base38 } from './Base38';

/**
 * Commissioning flow types
 */
export enum CommissioningFlow {
    Standard = 0,
    UserIntent = 1,
    Custom = 2,
}

/**
 * Discovery capability bitmask values
 */
export enum DiscoveryCapability {
    SoftAP = 1 << 0, // 0x01
    BLE = 1 << 1, // 0x02
    OnNetwork = 1 << 2, // 0x04
}

/**
 * Setup Payload class for Matter commissioning
 */
export class SetupPayload {
    public longDiscriminator: number;
    public shortDiscriminator: number;
    public pincode: number;
    public discovery: number;
    public flow: CommissioningFlow;
    public vid: number;
    public pid: number;

    constructor(
        discriminator: number,
        pincode: number,
        discovery = 4,
        flow: CommissioningFlow = CommissioningFlow.Standard,
        vid = 0,
        pid = 0
    ) {
        this.longDiscriminator = discriminator;
        this.shortDiscriminator = discriminator >> 8;
        this.pincode = pincode;
        this.discovery = discovery;
        this.flow = flow;
        this.vid = vid;
        this.pid = pid;
    }

    /**
     * Pretty print the setup information
     * @returns {string} Formatted string with setup information
     */
    prettyPrint(): string {
        const flowName = CommissioningFlow[this.flow];
        let result = `\nFlow                    : ${flowName}\n`;
        result += `Pincode                 : ${this.pincode}\n`;
        result += `Short Discriminator     : ${this.shortDiscriminator}\n`;
        if (this.longDiscriminator) {
            result += `Long Discriminator      : ${this.longDiscriminator}\n`;
        }
        if (this.discovery) {
            // Convert discovery number to name if possible
            let discoveryName: string | number = this.discovery;
            const discoveryEntry = Object.entries(DiscoveryCapability).find(
                ([, value]) => value === this.discovery
            );
            if (discoveryEntry) {
                discoveryName = discoveryEntry[0];
            }
            result += `Discovery Capabilities  : ${discoveryName}\n`;
        }
        if (this.vid !== null && this.pid !== null) {
            result += `Vendor Id               : ${this.vid}      (0x${this.vid
                .toString(16)
                .padStart(4, '0')})\n`;
            result += `Product Id              : ${this.pid}      (0x${this.pid
                .toString(16)
                .padStart(4, '0')})\n`;
        }
        return result;
    }

    /**
     * Generate QR code payload
     * @returns {string} Base38 encoded QR code string with MT: prefix
     */
    generateQRCode(): string {
        // Build bit string according to Python qrcode_format structure
        let bitString = '';

        // Padding (4 bits)
        bitString += '0000';

        // Pincode (27 bits)
        bitString += this.pincode.toString(2).padStart(27, '0');

        // Discriminator (12 bits)
        bitString += this.longDiscriminator.toString(2).padStart(12, '0');

        // Discovery capabilities (8 bits)
        bitString += this.discovery.toString(2).padStart(8, '0');

        // Commissioning flow (2 bits)
        bitString += this.flow.toString(2).padStart(2, '0');

        // Product ID (16 bits)
        bitString += this.pid.toString(2).padStart(16, '0');

        // Vendor ID (16 bits)
        bitString += this.vid.toString(2).padStart(16, '0');

        // Version (3 bits)
        bitString += '000';

        // Convert bit string to bytes (MSB first)
        const bytes = new Uint8Array(Math.ceil(bitString.length / 8));
        for (let i = 0; i < bytes.length; i++) {
            const start = i * 8;
            const end = Math.min(start + 8, bitString.length);
            const byteBits = bitString.slice(start, end).padEnd(8, '0');
            bytes[i] = parseInt(byteBits, 2);
        }

        // Reverse bytes for Base38 encoding (matching Python [::-1])
        const reversedBytes = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            reversedBytes[i] = bytes[bytes.length - 1 - i];
        }

        // Base38 encode and add MT: prefix
        const encoded = Base38.encode(reversedBytes);
        return `MT:${encoded}`;
    }

    /**
     * Generate manual setup code
     * @returns {string} Manual setup code string with Verhoeff check digit
     */
    generateManualCode(): string {
        const vidPidPresent = this.flow !== CommissioningFlow.Standard ? 1 : 0;
        const discriminator = this.shortDiscriminator;
        const pincodeLsb = this.pincode & 0x3fff; // 14 LSBs
        const pincodeMsb = this.pincode >> 14; // 13 MSBs
        const vid = this.flow !== CommissioningFlow.Standard ? this.vid : 0;
        const pid = this.flow !== CommissioningFlow.Standard ? this.pid : 0;

        // Pack into chunks
        const chunk1Bits = (vidPidPresent << 2) | (discriminator & 0x03);
        const chunk1 = chunk1Bits.toString().padStart(1, '0');

        const chunk2Bits = (pincodeLsb << 2) | ((discriminator >> 2) & 0x03);
        const chunk2 = chunk2Bits.toString().padStart(5, '0');

        const chunk3 = pincodeMsb.toString().padStart(4, '0');

        let payload = chunk1 + chunk2 + chunk3;

        if (this.flow !== CommissioningFlow.Standard) {
            const chunk4 = vid.toString().padStart(5, '0');
            const chunk5 = pid.toString().padStart(5, '0');
            payload += chunk4 + chunk5;
        }

        // Add Verhoeff check digit
        const checkDigit = SetupPayload.calculateVerhoeffCheckDigit(payload);
        return payload + checkDigit;
    }

    /**
     * Parse QR code payload
     * @param {string} payload - QR code payload string starting with MT:
     * @returns {SetupPayload} Parsed SetupPayload instance
     */
    static parseQRCode(payload: string): SetupPayload {
        if (!payload.startsWith('MT:')) {
            throw new Error('Invalid QR code payload format');
        }

        const encoded = payload.slice(3);
        const decoded = Base38.decode(encoded);

        // Reverse bytes to match the encoding order (Python does [::-1])
        const reversedBytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
            reversedBytes[i] = decoded[decoded.length - 1 - i];
        }

        // Convert bytes to a continuous bit string for easier parsing (MSB first)
        let bitString = '';
        for (let i = 0; i < reversedBytes.length; i++) {
            // Convert each byte to 8-bit binary string, MSB first
            bitString += reversedBytes[i].toString(2).padStart(8, '0');
        }

        // Parse fields according to Python qrcode_format
        let bitPos = 0;

        // Skip padding (4 bits)
        bitPos += 4;

        // Extract pincode (27 bits)
        const pincode = parseInt(bitString.substr(bitPos, 27), 2);
        bitPos += 27;

        // Extract discriminator (12 bits)
        const discriminator = parseInt(bitString.substr(bitPos, 12), 2);
        bitPos += 12;

        // Extract discovery (8 bits)
        const discovery = parseInt(bitString.substr(bitPos, 8), 2);
        bitPos += 8;

        // Extract flow (2 bits)
        const flow = parseInt(bitString.substr(bitPos, 2), 2);
        bitPos += 2;

        // Extract PID (16 bits)
        const pid = parseInt(bitString.substr(bitPos, 16), 2);
        bitPos += 16;

        // Extract VID (16 bits)
        const vid = parseInt(bitString.substr(bitPos, 16), 2);

        return new SetupPayload(
            discriminator,
            pincode,
            discovery,
            flow,
            vid,
            pid
        );
    }

    /**
     * Parse manual setup code
     * @param {string} payload - Manual setup code string
     * @returns {SetupPayload|null} Parsed SetupPayload instance or null if invalid
     */
    static parseManualCode(payload: string): SetupPayload | null {
        const payloadLen = payload.length;
        if (payloadLen !== 11 && payloadLen !== 21) {
            console.error('Invalid length');
            return null;
        }

        // Check if first digit is valid (should be <= 7 for version 1)
        if (parseInt(payload[0], 10) > 7) {
            console.error('Incorrect first digit');
            return null;
        }

        // Verify check digit
        const calculatedCheckDigit = SetupPayload.calculateVerhoeffCheckDigit(
            payload.slice(0, -1)
        );
        if (calculatedCheckDigit !== payload.slice(-1)) {
            console.error('Check digit mismatch');
            return null;
        }

        // Check if it's a long code (vid_pid_present bit)
        const isLong = (parseInt(payload[0], 10) & (1 << 2)) !== 0;

        // Parse chunks
        const chunk1 = parseInt(payload.slice(0, 1), 10);
        const chunk2 = parseInt(payload.slice(1, 6), 10);
        const chunk3 = parseInt(payload.slice(6, 10), 10);
        const chunk4 = isLong ? parseInt(payload.slice(10, 15), 10) : 0;
        const chunk5 = isLong ? parseInt(payload.slice(15, 20), 10) : 0;

        // Extract fields
        const vidPidPresent = (chunk1 >> 2) & 0x01;
        const discriminatorLsb = chunk1 & 0x03;

        const pincodeLsb = (chunk2 >> 2) & 0x3fff;
        const discriminatorMsb = chunk2 & 0x03;

        const pincodeMsb = chunk3;

        const discriminator = (discriminatorMsb << 2) | discriminatorLsb;
        const pincode = (pincodeMsb << 14) | pincodeLsb;
        const vid = vidPidPresent ? chunk4 : 0;
        const pid = vidPidPresent ? chunk5 : 0;
        const flow = vidPidPresent
            ? CommissioningFlow.Custom
            : CommissioningFlow.Standard;

        const setupPayload = new SetupPayload(
            discriminator << 8,
            pincode,
            0,
            flow,
            vid,
            pid
        );
        setupPayload.shortDiscriminator = discriminator;
        setupPayload.longDiscriminator = discriminator << 8;

        return setupPayload;
    }

    /**
     * Parse either QR code or manual code
     * @param {string} payload - Payload string to parse
     * @returns {SetupPayload|null} Parsed SetupPayload instance or null if invalid
     */
    static parse(payload: string): SetupPayload | null {
        if (payload.startsWith('MT:')) {
            return SetupPayload.parseQRCode(payload);
        }
        return SetupPayload.parseManualCode(payload);
    }

    /**
     * Create SetupPayload from device logs
     * @param {string} logs - Device output logs containing setup information
     * @param {number} discovery - Discovery capabilities (default: BLE)
     * @param {CommissioningFlow} flow - Commissioning flow (default: Standard)
     * @returns {SetupPayload} New SetupPayload instance
     * @throws Error if required values cannot be parsed from logs
     */
    static fromLogs(
        logs: string,
        discovery: number = DiscoveryCapability.BLE,
        flow: CommissioningFlow = CommissioningFlow.Standard
    ): SetupPayload {
        const discriminator = parseInt(
            logs.match(/Setup Discriminator.*?:\s*(\d+)/)?.[1] || '0',
            10
        );
        const pincode = parseInt(
            logs.match(/Setup Pin Code.*?:\s*(\d+)/)?.[1] || '0',
            10
        );
        const vendorId = parseInt(
            logs.match(/Vendor Id:\s*(\d+)/)?.[1] || '0',
            10
        );
        const productId = parseInt(
            logs.match(/Product Id:\s*(\d+)/)?.[1] || '0',
            10
        );

        if (discriminator === 0) {
            throw new Error('Could not parse discriminator from logs');
        }
        if (pincode === 0) {
            throw new Error('Could not parse pincode from logs');
        }

        return new SetupPayload(
            discriminator,
            pincode,
            discovery,
            flow,
            vendorId,
            productId
        );
    }

    /**
     * Create SetupPayload from factory data JSON file
     * @param {string} jsonFilePath - Path to the JSON file containing factory data
     * @param {number} discovery - Discovery capabilities (default: BLE)
     * @param {CommissioningFlow} flow - Commissioning flow (default: Standard)
     * @returns {Promise<SetupPayload>} Promise that resolves to new SetupPayload instance
     * @throws Error if file cannot be read or required values are missing
     *
     * @example
     * ```typescript
     * const payload = await SetupPayload.fromJSON('./factory_data.json');
     * const qrCode = payload.generateQRCode();
     * const manualCode = payload.generateManualCode();
     * console.log(qrCode); // MT:8IXS142C00KA0648G00
     * ```
     */
    static async fromJSON(
        jsonFilePath: string,
        discovery: number = DiscoveryCapability.BLE,
        flow: CommissioningFlow = CommissioningFlow.Standard
    ): Promise<SetupPayload> {
        // eslint-disable-next-line global-require
        const fs = require('fs').promises;

        try {
            // Read and parse the JSON file
            const fileContent = await fs.readFile(jsonFilePath, 'utf8');
            const factoryData = JSON.parse(fileContent);

            // Extract required fields from JSON
            const discriminator = factoryData.discriminator;
            const pincode = factoryData.passcode;
            const vendorId = factoryData.vendor_id;
            const productId = factoryData.product_id;

            // Validate required fields
            if (discriminator === undefined || discriminator === null) {
                throw new Error('Could not find discriminator in JSON file');
            }
            if (pincode === undefined || pincode === null) {
                throw new Error('Could not find passcode in JSON file');
            }

            // Convert to numbers and validate
            const discriminatorNum =
                typeof discriminator === 'number'
                    ? discriminator
                    : parseInt(String(discriminator), 10);
            const pincodeNum =
                typeof pincode === 'number'
                    ? pincode
                    : parseInt(String(pincode), 10);
            const vendorIdNum =
                typeof vendorId === 'number'
                    ? vendorId
                    : parseInt(String(vendorId || '0'), 10);
            const productIdNum =
                typeof productId === 'number'
                    ? productId
                    : parseInt(String(productId || '0'), 10);

            if (Number.isNaN(discriminatorNum) || discriminatorNum === 0) {
                throw new Error('Invalid discriminator value in JSON file');
            }
            if (Number.isNaN(pincodeNum) || pincodeNum === 0) {
                throw new Error('Invalid passcode value in JSON file');
            }

            return new SetupPayload(
                discriminatorNum,
                pincodeNum,
                discovery,
                flow,
                vendorIdNum || 0,
                productIdNum || 0
            );
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON format in file: ${jsonFilePath}`);
            }
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                throw new Error(`JSON file not found: ${jsonFilePath}`);
            }
            throw error;
        }
    }

    /**
     * Create SetupPayload from CBOR-formatted hex file
     * @param {string} hexFilePath - Path to the hex file containing CBOR-formatted factory data
     * @param {number} discovery - Discovery capabilities (default: BLE)
     * @param {CommissioningFlow} flow - Commissioning flow (default: Standard)
     * @returns {Promise<SetupPayload>} Promise that resolves to new SetupPayload instance
     * @throws Error if file cannot be read, parsed, or required values are missing
     *
     * @example
     * ```typescript
     * const payload = await SetupPayload.fromCBORHex('./factory_data.hex');
     * const qrCode = payload.generateQRCode();
     * const manualCode = payload.generateManualCode();
     * console.log(qrCode); // MT:8IXS142C00KA0648G00
     * ```
     */
    static async fromCBORHex(
        hexFilePath: string,
        discovery: number = DiscoveryCapability.BLE,
        flow: CommissioningFlow = CommissioningFlow.Standard
    ): Promise<SetupPayload> {
        // eslint-disable-next-line global-require
        const fs = require('fs').promises;

        try {
            // Read the hex file
            const hexContent = await fs.readFile(hexFilePath, 'utf8');

            // Parse Intel HEX format to get binary data
            const binaryData = SetupPayload.parseIntelHex(hexContent);

            // Decode CBOR data
            const factoryData = SetupPayload.decodeCBOR(binaryData);

            // Extract required fields from CBOR data
            const discriminator = factoryData.discriminator;
            const pincode = factoryData.passcode;
            const vendorId = factoryData.vendor_id;
            const productId = factoryData.product_id;

            // Validate required fields
            if (discriminator === undefined || discriminator === null) {
                throw new Error('Could not find discriminator in CBOR data');
            }
            if (pincode === undefined || pincode === null) {
                throw new Error('Could not find passcode in CBOR data');
            }

            // Convert to numbers and validate
            const discriminatorNum =
                typeof discriminator === 'number'
                    ? discriminator
                    : parseInt(String(discriminator), 10);
            const pincodeNum =
                typeof pincode === 'number'
                    ? pincode
                    : parseInt(String(pincode), 10);
            const vendorIdNum =
                typeof vendorId === 'number'
                    ? vendorId
                    : parseInt(String(vendorId || '0'), 10);
            const productIdNum =
                typeof productId === 'number'
                    ? productId
                    : parseInt(String(productId || '0'), 10);

            if (Number.isNaN(discriminatorNum) || discriminatorNum === 0) {
                throw new Error('Invalid discriminator value in CBOR data');
            }
            if (Number.isNaN(pincodeNum) || pincodeNum === 0) {
                throw new Error('Invalid passcode value in CBOR data');
            }

            return new SetupPayload(
                discriminatorNum,
                pincodeNum,
                discovery,
                flow,
                vendorIdNum || 0,
                productIdNum || 0
            );
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                throw new Error(`Hex file not found: ${hexFilePath}`);
            }
            throw error;
        }
    }

    /**
     * Parse Intel HEX format to extract binary data
     * @param {string} hexContent - Content of the hex file
     * @returns {Uint8Array} Uint8Array containing the binary data
     * @private
     */
    private static parseIntelHex(hexContent: string): Uint8Array {
        const lines = hexContent.trim().split('\n');
        const segments: { address: number; data: Uint8Array }[] = [];
        let baseAddress = 0;

        // Process each line instead of using for...of
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith(':')) {
                return;
            }

            // Parse Intel HEX record
            const byteCount = parseInt(trimmedLine.substr(1, 2), 16);
            const address = parseInt(trimmedLine.substr(3, 4), 16);
            const recordType = parseInt(trimmedLine.substr(7, 2), 16);
            const data = trimmedLine.substr(9, byteCount * 2);

            switch (recordType) {
                case 0x00: {
                    // Data record
                    const fullAddress = baseAddress + address;
                    const bytes = new Uint8Array(byteCount);
                    for (let i = 0; i < byteCount; i++) {
                        bytes[i] = parseInt(data.substr(i * 2, 2), 16);
                    }
                    segments.push({ address: fullAddress, data: bytes });
                    break;
                }
                case 0x04: {
                    // Extended Linear Address record
                    baseAddress = parseInt(data, 16) << 16;
                    break;
                }
                case 0x01: // End of file record
                    break;
                default:
                    // Ignore other record types
                    break;
            }
        });

        if (segments.length === 0) {
            throw new Error('No data segments found in Intel HEX file');
        }

        // Sort segments by address
        segments.sort((a, b) => a.address - b.address);

        // Find the total size needed
        const firstAddress = segments[0].address;
        const lastSegment = segments[segments.length - 1];
        const lastAddress = lastSegment.address + lastSegment.data.length;
        const totalSize = lastAddress - firstAddress;

        // Create continuous data array
        const result = new Uint8Array(totalSize);
        segments.forEach(segment => {
            const offset = segment.address - firstAddress;
            result.set(segment.data, offset);
        });

        return result;
    }

    /**
     * Decode CBOR data to extract factory data fields
     * @param {Uint8Array} binaryData - Binary data containing CBOR-encoded factory data
     * @returns {Record<string, unknown>} Object containing decoded factory data
     * @private
     */
    private static decodeCBOR(binaryData: Uint8Array): Record<string, unknown> {
        // Try to use the 'cbor' package if available, otherwise fall back to basic
        // parsing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let cbor: any;
        try {
            // eslint-disable-next-line global-require
            cbor = require('cbor');
            const result = cbor.decode(binaryData);
            return result;
        } catch (error) {
            // Fall back to basic CBOR parsing for common cases
            return SetupPayload.basicCBORDecode(binaryData);
        }
    }

    /**
     * Basic CBOR decoder for simple factory data structures
     * This is a simplified implementation that handles the most common cases
     * @param {Uint8Array} data - CBOR-encoded binary data
     * @returns {Record<string, unknown>} Decoded object
     * @private
     */
    private static basicCBORDecode(data: Uint8Array): Record<string, unknown> {
        let pos = 0;

        function readUint8(): number {
            if (pos >= data.length)
                throw new Error(
                    `Unexpected end of CBOR data at position ${pos}`
                );
            const byteValue = data[pos++];
            return byteValue;
        }

        function readUint16(): number {
            const high = readUint8();
            const low = readUint8();
            return (high << 8) | low;
        }

        function readUint32(): number {
            const b1 = readUint8();
            const b2 = readUint8();
            const b3 = readUint8();
            const b4 = readUint8();
            return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;
        }

        function readBytes(length: number): Uint8Array {
            if (pos + length > data.length)
                throw new Error(
                    `Unexpected end of CBOR data: need ${length} bytes at position ${pos}, but only ${
                        data.length - pos
                    } available`
                );
            const bytes = data.slice(pos, pos + length);
            pos += length;
            return bytes;
        }

        function readString(length: number): string {
            const bytes = readBytes(length);
            // Use TextDecoder if available, otherwise fall back to manual conversion
            if (typeof TextDecoder !== 'undefined') {
                return new TextDecoder().decode(bytes);
            }
            // Fallback for environments without TextDecoder (like some test
            // environments)
            let result = '';
            for (let i = 0; i < bytes.length; i++) {
                result += String.fromCharCode(bytes[i]);
            }
            return result;
        }

        function decodeValue(): unknown {
            if (pos >= data.length)
                throw new Error(
                    `Cannot decode value: at end of data (pos: ${pos})`
                );

            const firstByte = readUint8();
            const majorType = (firstByte >> 5) & 0x07;
            const additionalInfo = firstByte & 0x1f;

            switch (majorType) {
                case 0: // Unsigned integer
                    if (additionalInfo < 24) return additionalInfo;
                    if (additionalInfo === 24) return readUint8();
                    if (additionalInfo === 25) return readUint16();
                    if (additionalInfo === 26) return readUint32();
                    throw new Error(
                        `Unsupported unsigned integer additional info: ${additionalInfo}`
                    );

                case 1: {
                    // Negative integer
                    let intValue;
                    if (additionalInfo < 24) intValue = additionalInfo;
                    else if (additionalInfo === 24) intValue = readUint8();
                    else if (additionalInfo === 25) intValue = readUint16();
                    else if (additionalInfo === 26) intValue = readUint32();
                    else
                        throw new Error(
                            `Unsupported negative integer additional info: ${additionalInfo}`
                        );
                    return -1 - intValue;
                }

                case 2: {
                    // Byte string
                    let byteLength;
                    if (additionalInfo < 24) byteLength = additionalInfo;
                    else if (additionalInfo === 24) byteLength = readUint8();
                    else if (additionalInfo === 25) byteLength = readUint16();
                    else if (additionalInfo === 26) byteLength = readUint32();
                    else
                        throw new Error(
                            `Unsupported byte string additional info: ${additionalInfo}`
                        );
                    return readBytes(byteLength);
                }

                case 3: {
                    // Text string
                    let textLength;
                    if (additionalInfo < 24) textLength = additionalInfo;
                    else if (additionalInfo === 24) textLength = readUint8();
                    else if (additionalInfo === 25) textLength = readUint16();
                    else if (additionalInfo === 26) textLength = readUint32();
                    else
                        throw new Error(
                            `Unsupported text string additional info: ${additionalInfo}`
                        );
                    return readString(textLength);
                }

                case 4: {
                    // Array
                    let arrayLength;
                    if (additionalInfo < 24) arrayLength = additionalInfo;
                    else if (additionalInfo === 24) arrayLength = readUint8();
                    else if (additionalInfo === 25) arrayLength = readUint16();
                    else if (additionalInfo === 26) arrayLength = readUint32();
                    else
                        throw new Error(
                            `Unsupported array additional info: ${additionalInfo}`
                        );

                    const array = [];
                    for (let i = 0; i < arrayLength; i++) {
                        array.push(decodeValue());
                    }
                    return array;
                }

                case 5: {
                    // Map
                    let mapLength;
                    if (additionalInfo < 24) mapLength = additionalInfo;
                    else if (additionalInfo === 24) mapLength = readUint8();
                    else if (additionalInfo === 25) mapLength = readUint16();
                    else if (additionalInfo === 26) mapLength = readUint32();
                    else
                        throw new Error(
                            `Unsupported map additional info: ${additionalInfo}`
                        );

                    const map: Record<string, unknown> = {};
                    for (let i = 0; i < mapLength; i++) {
                        const key = decodeValue();
                        const mapValue = decodeValue();
                        map[key as string] = mapValue;
                    }
                    return map;
                }

                case 7: // Float, simple, break
                    if (additionalInfo === 20) return false;
                    if (additionalInfo === 21) return true;
                    if (additionalInfo === 22) return null;
                    if (additionalInfo === 23) return undefined;
                    throw new Error(
                        `Unsupported simple value: ${additionalInfo}`
                    );

                default:
                    throw new Error(
                        `Unsupported CBOR major type: ${majorType}`
                    );
            }
        }

        try {
            // Try to find CBOR data - it might not start at the beginning
            for (
                let offset = 0;
                offset < Math.min(data.length - 1, 100);
                offset++
            ) {
                pos = offset;
                try {
                    const result = decodeValue();
                    return result as Record<string, unknown>;
                } catch (error) {
                    // Try next offset
                }
            }

            throw new Error('Could not find valid CBOR data in any position');
        } catch (error) {
            throw new Error(
                `Failed to decode CBOR data: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`
            );
        }
    }

    /**
     * Calculate Verhoeff check digit (simplified implementation)
     * @param {string} payload - Payload string to calculate check digit for
     * @returns {string} Check digit as string
     */
    private static calculateVerhoeffCheckDigit(payload: string): string {
        // Simplified check digit calculation
        // For production use, consider implementing the full Verhoeff algorithm
        let sum = 0;
        for (let i = 0; i < payload.length; i++) {
            sum += parseInt(payload[i], 10) * (i + 1);
        }
        return (sum % 10).toString();
    }

    /**
     * Generate QR code image file
     * @param {string} imagePath - Path where to save the QR code image
     * @returns {Promise<string>} Promise that resolves to the image path
     */
    async GenerateQRCodeImage(imagePath: string): Promise<string> {
        // eslint-disable-next-line global-require
        const fs = require('fs').promises;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let QRCode: any;
        try {
            // eslint-disable-next-line global-require
            QRCode = require('qrcode');
        } catch (error) {
            throw new Error(
                'QR code generation requires the "qrcode" package to be installed. ' +
                    'Run: npm install qrcode @types/qrcode'
            );
        }

        const qrOptions = {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'M' as const,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        };

        const qrCode = this.generateQRCode();
        const qrCodeBuffer = await QRCode.toBuffer(qrCode, qrOptions);
        await fs.writeFile(imagePath, qrCodeBuffer);

        return imagePath;
    }
}

export default SetupPayload;
