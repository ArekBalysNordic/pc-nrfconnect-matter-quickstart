/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import { Back } from '../Back';
import Guide from '../Guide';
import Main from '../Main';
import { Next } from '../Next';

const EcosystemSetupStep = () => {
    const ecosystem = getSelectedEcosystem();

    return (
        <Main>
            <Main.Content
                heading={`Complete the requirements for the ${ecosystem?.name}`}
                subHeading={`Follow the instructions below to setup ${ecosystem?.hubName} for the ${ecosystem?.name} ecosystem:`}
            >
                <Guide
                    steps={ecosystem?.setupManual}
                    mediaSrc={ecosystem?.setupVideo}
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
    name: 'Setup',
    component: EcosystemSetupStep,
});
