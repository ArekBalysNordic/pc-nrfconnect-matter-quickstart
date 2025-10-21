/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppSelector } from '../../app/store';
import { getChoiceUnsafely } from '../../features/device/deviceSlice';
import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import {
    getSelectedPairingConfig,
    getSelectedPairingGuide,
} from '../../features/flows/pairingConfig';
import { Back } from '../Back';
import Guide from '../Guide';
import Main from '../Main';
import { Next } from '../Next';
import { SetupPayload } from '../SetupPayload';
import { tempFileManager } from '../TempFileManager';

const PairingStep = () => {
    const ecosystem = getSelectedEcosystem();
    const previouslySelectedChoice = useAppSelector(getChoiceUnsafely);
    const [qrCodePath, setQrCodePath] = useState<string>('');
    const [manualCode, setManualCode] = useState<string>('');
    const pairingGuide = getSelectedPairingGuide(
        previouslySelectedChoice.name,
        ecosystem.name
    );

    const generateQRCode = async (factoryData: string): Promise<string> => {
        try {
            logger.info(`Generating QR code for ${factoryData}`);
            const payload = await SetupPayload.fromCBORHex(factoryData);
            const qrCode = payload.generateQRCode();

            logger.info('QR Code:', qrCode);
            logger.info(payload.prettyPrint());

            logger.info('Generating QR code image...');
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
                subHeading={`Follow the instructions below to pair your ${previouslySelectedChoice.name} device with the ${ecosystem.name}:`}
            >
                <Guide
                    qrcode={qrCodePath}
                    qrcodeStep={pairingGuide?.qrcodeStep}
                    manualCode={manualCode}
                    steps={pairingGuide?.guide || []}
                    mediaSrc={pairingGuide?.video || ''}
                />
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
