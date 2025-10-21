/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/store';
import { getChoiceUnsafely } from '../../features/device/deviceSlice';
import { goToNextStep, goToPreviousStep } from '../../features/flow/flowSlice';
import {
    AdvertisingData,
    getSelectedPairingConfig,
} from '../../features/flows/pairingConfig';
import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';

let previous = false;

const EnableAdvertisingStep = (advertisingData: AdvertisingData) => {
    const choice = useAppSelector(getChoiceUnsafely);
    const dispatch = useAppDispatch();
    const pairingConfig = getSelectedPairingConfig(choice.name);

    useEffect(() => {
        if (previous) {
            dispatch(goToPreviousStep());
            previous = false;
        } else if (pairingConfig?.autoAdvertise) {
            previous = true;
            dispatch(goToNextStep());
        }
    }, [pairingConfig?.autoAdvertise, dispatch]);

    return (
        <Main>
            {pairingConfig?.autoAdvertise ? null : (
                <>
                    <Main.Content
                        heading="Enable Bluetooth Low Energy advertising"
                        subHeading="Follow the instructions below to enable Bluetooth Low Energy advertising:"
                    >
                        <div>
                            {(() => {
                                const { button, enablePairingImage } =
                                    advertisingData;
                                return (
                                    <div className="tw-flex tw-flex-col tw-gap-8">
                                        <div>
                                            Press <b>{button}</b> on the
                                            development kit to enable Bluetooth
                                            Low Energy advertising (see the
                                            image below).
                                        </div>
                                        <img
                                            src={enablePairingImage}
                                            alt={`Pairing with ${choice.name}`}
                                            className="tw-h-auto tw-max-h-[300px] tw-max-w-full tw-object-contain"
                                        />
                                    </div>
                                );
                            })()}
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

export default (advertisingData: AdvertisingData) => ({
    name: 'Advertising',
    component: () => EnableAdvertisingStep(advertisingData),
});
