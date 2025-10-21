/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useAppSelector } from '../../app/store';
import { getChoiceUnsafely } from '../../features/device/deviceSlice';
import {
    getSelectedControllingGuide,
    HardwareParams,
} from '../../features/flows/controllingConfig';
import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import { Back } from '../Back';
import Guide from '../Guide';
import Main from '../Main';
import { Next } from '../Next';

const InteractionStep = ({
    hardwareParams,
}: {
    hardwareParams: HardwareParams;
}) => {
    const ecosystem = getSelectedEcosystem();
    const previouslySelectedChoice = useAppSelector(getChoiceUnsafely);
    const controllingGuide = getSelectedControllingGuide(
        previouslySelectedChoice.name,
        ecosystem.name,
        hardwareParams
    );

    return (
        <Main>
            <Main.Content
                heading={`Interact with your ${previouslySelectedChoice.name} device using the ${ecosystem?.name} app`}
                subHeading={`Follow the instructions below to interact with your ${previouslySelectedChoice.name} device using the ${ecosystem?.name} app:`}
            >
                <Guide
                    steps={controllingGuide?.guide || []}
                    mediaSrc={controllingGuide?.video || ''}
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

export default (hardwareParams: HardwareParams) => ({
    name: 'Interaction',
    component: () => InteractionStep({ hardwareParams }),
});
