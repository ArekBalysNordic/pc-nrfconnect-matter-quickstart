/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { logger, telemetry } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppSelector } from '../../app/store';
import { getChoice } from '../../features/device/deviceSlice';
import {
    EcosystemConfig,
    ecosystemConfig,
    setSelectedEcosystem,
} from '../../features/flows/ecosystemConfig';
import { Back } from '../Back';
import { RadioSelect } from '../listSelect/RadioSelect';
import Main from '../Main';
import { Next } from '../Next';

const SelectEcosystemStep = () => {
    const [selected, setSelected] = useState<EcosystemConfig | undefined>(
        undefined
    );
    const currentChoice = useAppSelector(getChoice);

    // Filter ecosystems to only show those that support the current device type
    const filteredEcosystems = ecosystemConfig.filter(
        ecosystem =>
            currentChoice?.name &&
            ecosystem.supportedDeviceTypes.includes(currentChoice.name)
    );

    const isSelected = (name: string) => {
        const result = selected?.name === name;
        // Debug log to see if ecosystem is selected

        logger.debug(`isSelected("${name}"):`, result, 'selected:', selected);
        return result;
    };

    return (
        <Main>
            <Main.Content
                heading="Select the ecosystem"
                subHeading="Select the ecosystem you want to work with:"
            >
                <RadioSelect
                    items={filteredEcosystems.map(ecosystem => ({
                        id: ecosystem.name,
                        selected: isSelected(ecosystem.name),
                        onClick: () => {},
                        content: (
                            <span className="tw-text-lg tw-font-medium">
                                {ecosystem.description}
                            </span>
                        ),
                    }))}
                    onSelect={item => {
                        const found = filteredEcosystems.find(
                            ecosystem => ecosystem.name === item.id
                        );
                        if (found) {
                            setSelected(found);
                        }
                    }}
                />
            </Main.Content>
            <Main.Footer>
                <Back />
                <Next
                    disabled={!selected}
                    onClick={next => {
                        if (!selected) return;
                        setSelected(selected);
                        setSelectedEcosystem(selected);
                        telemetry.sendEvent('Selected ecosystem', {
                            ecosystem: selected.name,
                        });
                        next();
                    }}
                />
            </Main.Footer>
        </Main>
    );
};

export default () => ({
    name: 'Ecosystem',
    component: () => SelectEcosystemStep(),
});
