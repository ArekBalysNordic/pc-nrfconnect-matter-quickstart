/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/store';
import {
    getChoiceUnsafely,
    getSelectedDeviceUnsafely,
} from '../../features/device/deviceSlice';
import { goToNextStep, goToPreviousStep } from '../../features/flow/flowSlice';
import { getSelectedPairingConfig } from '../../features/flows/pairingConfig';
import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';

import '../../app/App.scss';

let previous = false;

const EnableAdvertisingStep = (pairingImage: string) => {
    const choice = useAppSelector(getChoiceUnsafely);
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    console.log('device', device.devkit?.deviceFamily);
    const button =
        device.devkit?.deviceFamily === 'NRF54L_FAMILY'
            ? 'Button 0'
            : 'Button 1';
    const pairingConfig = getSelectedPairingConfig(choice.name);

    useEffect(() => {
        console.log('previous', previous);
        if (previous) {
            dispatch(goToPreviousStep());
            previous = false;
        } else if (pairingConfig?.autoAdvertise) {
            console.log('choice.autoAdvertise', pairingConfig.autoAdvertise);
            previous = true;
            dispatch(goToNextStep());
        }
    }, [pairingConfig?.autoAdvertise, dispatch]);

    return (
        <Main>
            {pairingConfig?.autoAdvertise ? null : (
                <>
                    <Main.Content heading="Enable Bluetooth Low Energy advertising">
                        <div>
                            This example does not enable Bluetooth Low Energy
                            advertising automatically.
                            <br />
                            <br />
                            Press <b>{button}</b> on the development kit to
                            enable Bluetooth Low Energy advertising (see the
                            image below).
                            <br />
                            <br />
                            <div className="advertising-content">
                                <img
                                    src={pairingImage}
                                    alt="Pairing with nRF54L15 DK"
                                />
                            </div>
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
                </>
            )}
        </Main>
    );
};

export default (pairingImage: string) => ({
    name: 'Enable Advertising',
    component: () => EnableAdvertisingStep(pairingImage),
});
