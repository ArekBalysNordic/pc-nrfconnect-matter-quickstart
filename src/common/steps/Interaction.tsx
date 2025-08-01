/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

// TODO: Make these images part of the ecosystem data structure and replace with ecosystem specific images
import phoneImg from '../../../resources/phone.png';
import { useAppSelector } from '../../app/store';
import { getChoiceUnsafely } from '../../features/device/deviceSlice';
import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';

interface InteractionProps {
    name: string;
    instruction: string;
}

interface InteractionStepProps {
    interactions: InteractionProps[];
}

const InteractionStep = ({ interactions }: InteractionStepProps) => {
    const ecosystem = getSelectedEcosystem();
    const previouslySelectedChoice = useAppSelector(getChoiceUnsafely);
    const interaction = interactions.find(
        i => i.name === previouslySelectedChoice.name
    );

    return (
        <Main>
            <Main.Content
                heading={`Interact with your ${previouslySelectedChoice.name} device using the ${ecosystem?.name} app`}
            >
                <div style={{ fontSize: '1.2em' }}>
                    {interaction?.instruction}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: 24,
                        gap: 32,
                    }}
                >
                    <img
                        src={phoneImg}
                        alt="Phone controlling Matter accessory"
                        style={{ width: 400 }}
                    />
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

export default (interactions: InteractionProps[]) => ({
    name: 'Interaction',
    component: () => InteractionStep({ interactions }),
});
