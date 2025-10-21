/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';

import { Back } from '../Back';
import Main from '../Main';
import { overWriteA } from '../Markdown';
import { Next } from '../Next';

interface Props {
    title: string;
    dkImage: string;
    dkTechnologiesImage: string;
    SoCDescription: string;
    additionalInformation: string;
    documentationLink: string;
}

const InfoStep = ({
    title,
    dkImage,
    dkTechnologiesImage,
    SoCDescription,
    additionalInformation,
    documentationLink,
}: Props) => (
    <Main>
        <Main.Content heading={title}>
            <div className="tw-flex tw-flex-col tw-gap-6">
                <img
                    src={dkImage}
                    alt="DK"
                    className="tw-mx-auto tw-block tw-max-h-[200px] tw-max-w-md"
                />
                <ReactMarkdown>{SoCDescription}</ReactMarkdown>
                <img
                    src={dkTechnologiesImage}
                    alt="DK Technologies"
                    className="tw-mx-auto tw-block tw-max-w-md"
                />
                <ReactMarkdown>{additionalInformation}</ReactMarkdown>
                <ReactMarkdown
                    components={{
                        a: overWriteA,
                    }}
                >
                    {`Learn more on the [documentation](${documentationLink}) page.`}
                </ReactMarkdown>
            </div>
        </Main.Content>
        <Main.Footer>
            <Back />
            <Next />
        </Main.Footer>
    </Main>
);

export default (props: Props) => ({
    name: 'Info',
    component: () => InfoStep(props),
});
