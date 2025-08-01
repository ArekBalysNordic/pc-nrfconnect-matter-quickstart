/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-bitwise */

// Base38 alphabet for encoding
const BASE38_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-.';

/**
 * Base38 encoding utilities (Matter specification implementation)
 */
export class Base38 {
    private static readonly RADIX = 38;
    private static readonly BASE38_CHARS_NEEDED_IN_CHUNK = [2, 4, 5];
    private static readonly MAX_BYTES_IN_CHUNK = 3;
    private static readonly MAX_ENCODED_BYTES_IN_CHUNK = 5;

    /**
     * Encode bytes to Base38 string using chunked approach
     * @param {Uint8Array} bytes - The bytes to encode
     * @returns {string} The Base38 encoded string
     */
    static encode(bytes: Uint8Array): string {
        const totalBytes = bytes.length;
        let qrcode = '';

        for (let i = 0; i < totalBytes; i += Base38.MAX_BYTES_IN_CHUNK) {
            let bytesInChunk: number;
            if (i + Base38.MAX_BYTES_IN_CHUNK > totalBytes) {
                bytesInChunk = totalBytes - i;
            } else {
                bytesInChunk = Base38.MAX_BYTES_IN_CHUNK;
            }

            let value = 0;
            let j = i;
            while (j < i + bytesInChunk) {
                value += bytes[j] << (8 * (j - i));
                j += 1;
            }

            let base38CharsNeeded =
                Base38.BASE38_CHARS_NEEDED_IN_CHUNK[bytesInChunk - 1];
            while (base38CharsNeeded > 0) {
                qrcode += BASE38_ALPHABET[Math.floor(value % Base38.RADIX)];
                value = Math.floor(value / Base38.RADIX);
                base38CharsNeeded -= 1;
            }
        }

        return qrcode;
    }

    /**
     * Decode Base38 string to bytes using chunked approach
     * @param {string} qrcode - The Base38 encoded string to decode
     * @returns {Uint8Array} The decoded bytes as Uint8Array
     */
    static decode(qrcode: string): Uint8Array {
        const totalChars = qrcode.length;
        const decodedBytes: number[] = [];

        for (
            let i = 0;
            i < totalChars;
            i += Base38.MAX_ENCODED_BYTES_IN_CHUNK
        ) {
            let charsInChunk: number;
            if (i + Base38.MAX_ENCODED_BYTES_IN_CHUNK > totalChars) {
                charsInChunk = totalChars - i;
            } else {
                charsInChunk = Base38.MAX_ENCODED_BYTES_IN_CHUNK;
            }

            let value = 0;
            for (let j = i + charsInChunk - 1; j >= i; j -= 1) {
                const charIndex = BASE38_ALPHABET.indexOf(qrcode[j]);
                if (charIndex === -1) {
                    throw new Error(`Invalid Base38 character: ${qrcode[j]}`);
                }
                value = value * Base38.RADIX + charIndex;
            }

            const bytesInChunk =
                Base38.BASE38_CHARS_NEEDED_IN_CHUNK.indexOf(charsInChunk) + 1;
            for (let k = 0; k < bytesInChunk; k += 1) {
                decodedBytes.push(value & 0xff);
                value >>= 8;
            }
        }

        return new Uint8Array(decodedBytes);
    }
}
