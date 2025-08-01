/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import path from 'path';

import { useAppSelector } from '../../app/store';
import { getChoiceUnsafely } from '../../features/device/deviceSlice';
import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import { getSelectedPairingConfig } from '../../features/flows/pairingConfig';
import { Back } from '../Back';
import Link from '../Link';
import Main from '../Main';
import { Next } from '../Next';
import { SetupPayload } from '../SetupPayload';
import { tempFileManager } from '../TempFileManager';

import '../../app/App.scss';

const PairingStep = () => {
    const ecosystem = getSelectedEcosystem();
    const previouslySelectedChoice = useAppSelector(getChoiceUnsafely);
    const [qrCodePath, setQrCodePath] = useState<string>('');
    const [manualCode, setManualCode] = useState<string>('');

    const generateQRCode = async (factoryData: string): Promise<string> => {
        try {
            logger.info(`Generating QR code for ${factoryData}`);
            const payload = await SetupPayload.fromCBORHex(factoryData);
            payload.generateQRCode();

            logger.info(payload.prettyPrint());

            return await payload.GenerateQRCodeImage(
                tempFileManager.createTempFilePath()
            );
        } catch (error) {
            logger.error(error);
            return '';
        }
    };

    const generateManualCode = async (factoryData: string): Promise<void> => {
        try {
            logger.info(`Generating pairing pin code for ${factoryData}`);
            const payload = await SetupPayload.fromCBORHex(factoryData);
            setManualCode(payload.generateManualCode());
        } catch (error) {
            logger.error(error);
        }
    };

    useEffect(() => {
        const factoryData =
            getSelectedPairingConfig(previouslySelectedChoice.name)
                ?.factoryData || '';
        if (factoryData) {
            generateQRCode(factoryData).then(setQrCodePath);
            generateManualCode(factoryData);
        }
    }, [previouslySelectedChoice.name]);

    return (
        <Main>
            <Main.Content
                heading={`Pair your ${previouslySelectedChoice.name} device with the ${ecosystem.name}`}
            >
                <div className="pairing-description">
                    Open the <b>{ecosystem?.name}</b> app, tap <b>+</b> button,
                    and scan the QR code or enter the pairing pin code.
                </div>
                <div className="pairing-content-container">
                    <img
                        src={path.resolve(__dirname, ecosystem.pairingImage)}
                        alt="Phone adding Matter accessory"
                        className="pairing-phone-image"
                    />
                    {qrCodePath ? (
                        <div className="pairing-qr-container">
                            <img
                                src={`file://${qrCodePath}`}
                                alt="QR Code for Matter device commissioning"
                                className="pairing-qr-image"
                            />
                            {manualCode ? (
                                <div className="pairing-manual-code">
                                    <span className="pairing-manual-code-label">
                                        Pairing PIN code:
                                    </span>
                                    <span className="pairing-manual-code-value">
                                        {manualCode}
                                    </span>
                                </div>
                            ) : (
                                <div className="pairing-manual-code-error">
                                    Manual code cannot be read. Please try
                                    again.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pairing-qr-error-placeholder">
                            QR Code cannot be read. Please try again.
                        </div>
                    )}
                </div>
                <hr
                    style={{
                        margin: '32px 0',
                        border: 'none',
                        borderTop: '1px solid #e0e0e0',
                    }}
                />
                <div>
                    For more information, see the {ecosystem.name}{' '}
                    <Link
                        label="manual pairing guide"
                        href={ecosystem.pairingManual}
                        color="hover:tw-text-gray-700"
                    />
                    .
                </div>
            </Main.Content>
            <Main.Footer>
                <Back />
                <Next
                    onClick={next => {
                        next();
                    }}
                />
            </Main.Footer>
        </Main>
    );
};

export default () => ({
    name: 'Pairing',
    component: () => PairingStep(),
});
