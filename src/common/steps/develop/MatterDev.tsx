/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { useAppDispatch } from '../../../app/store';
import { Back } from '../../Back';
import Main from '../../Main';
import { Next } from '../../Next';
import {
    ResourcesWithdDownloadAndGuide,
    ResourceWithDownloadAndGuide,
} from '../../Resource';
import { DevelopState, setDevelopState } from './developSlice';

export default ({
    resources,
}: {
    resources: ResourcesWithdDownloadAndGuide[];
}) => {
    const dispatch = useAppDispatch();
    return (
        <Main>
            <Main.Content
                heading="Prepare for developing Matter applications"
                subHeading="Kickstart your Matter application development with these tools and resources designed to streamline your workflow and unlock the full potential of your device."
            >
                <div className="tw-flex tw-flex-col tw-items-start tw-justify-start tw-gap-8">
                    {resources.map(props => (
                        <ResourceWithDownloadAndGuide
                            {...props}
                            key={props.label}
                        />
                    ))}
                </div>
            </Main.Content>
            <Main.Footer>
                <Back />
                <Next
                    onClick={() => {
                        dispatch(setDevelopState(DevelopState.CHOOSE));
                    }}
                />
            </Main.Footer>
        </Main>
    );
};
