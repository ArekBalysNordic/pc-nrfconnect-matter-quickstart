/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

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

    const isSelected = (name: string) => {
        const result = selected?.name === name;
        // Debug log to see if ecosystem is selected

        logger.debug(`isSelected("${name}"):`, result, 'selected:', selected);
        return result;
    };

    return (
        <Main>
            <Main.Content heading="Select an ecosystem you want to work with">
                <RadioSelect
                    items={ecosystemConfig.map(ecosystem => ({
                        id: ecosystem.name,
                        selected: isSelected(ecosystem.name),
                        onClick: () => {},
                        content: (
                            <span className="tw-text-lg tw-font-semibold">
                                {ecosystem.description}
                            </span>
                        ),
                    }))}
                    onSelect={item => {
                        const found = ecosystemConfig.find(
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
                        next();
                    }}
                />
            </Main.Footer>
        </Main>
    );
};

export default () => ({
    name: 'Select Ecosystem',
    component: () => SelectEcosystemStep(),
});
