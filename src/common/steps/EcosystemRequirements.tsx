/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

// TODO: Make these images part of the ecosystem data structure and replace with ecosystem specific images
import phoneImg from '../../../resources/phone.png';
import hubImg from '../../../resources/smart_speaker_mini.png';
import { getSelectedEcosystem } from '../../features/flows/ecosystemConfig';
import { Back } from '../Back';
import Main from '../Main';
import { Next } from '../Next';

const EcosystemRequirementsStep = () => {
    const ecosystem = getSelectedEcosystem();

    return (
        <Main>
            <Main.Content
                heading={`Complete the requirements for the ${ecosystem?.name}`}
            >
                <div style={{ fontSize: '1.2em' }}>
                    Visit the{' '}
                    {ecosystem?.link ? (
                        <a
                            href={ecosystem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontStyle: 'italic',
                                color: 'rgb(0, 169, 206)',
                            }}
                        >
                            {ecosystem.name}
                        </a>
                    ) : (
                        ecosystem?.name
                    )}{' '}
                    webpage to learn more about the application and Matter
                    support.
                </div>
                <div style={{ padding: '20px 0', fontSize: '1.2em' }}>
                    You are going to need the following devices and tools to use
                    this ecosystem:
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '30px 0',
                        alignItems: 'flex-start',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'left',
                            fontWeight: 'bold',
                            fontSize: '1.5em',
                            marginLeft: '40px',
                        }}
                    >
                        Home Hub with Thread Border Router
                        <img
                            src={hubImg}
                            alt="Home Hub"
                            style={{
                                display: 'block',
                                margin: '20px auto 0 0',
                                maxWidth: '600px',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '1.5em',
                            marginRight: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        Smartphone with {ecosystem?.name} application installed
                        <img
                            src={phoneImg}
                            alt="Smartphone"
                            style={{
                                display: 'block',
                                margin: '20px auto 0 auto',
                                maxWidth: '600px',
                            }}
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
        </Main>
    );
};

export default () => ({
    name: 'Ecosystem Requirements',
    component: EcosystemRequirementsStep,
});
