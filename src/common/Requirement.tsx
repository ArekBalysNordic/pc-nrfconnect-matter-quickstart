/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';

import { overWriteA, overwriteEm, overwriteInfoImg } from './Markdown';

interface MediaProps {
    path: string[];
    alt: string[];
    text: string;
    description: string;
    visit_note: string;
}

interface RequirementProps {
    content: MediaProps[];
}

const Requirement = ({ content }: RequirementProps) => (
    // Container
    <div className="tw-flex tw-flex-col tw-gap-8">
        {/* Media container */}
        <div className="tw-flex tw-flex-row tw-gap-8">
            {/* Media items */}
            {content.map((media, index) => (
                <div
                    key={
                        typeof media.text === 'string'
                            ? media.text.slice(0, 40)
                            : `media-${index}`
                    }
                    className="tw-flex tw-flex-1 tw-flex-col tw-gap-6"
                >
                    {/* Media item */}
                    <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-8">
                        {/* Media text */}
                        <ReactMarkdown
                            className="tw-text-center"
                            components={{
                                a: overWriteA,
                                em: overwriteEm,
                                img: overwriteInfoImg,
                            }}
                        >
                            {media.text}
                        </ReactMarkdown>
                        {/* Media images */}
                        <div className="tw-flex tw-flex-row">
                            {media.path.map((imgSrc, imgIdx) => (
                                <div
                                    key={imgSrc}
                                    className="tw-flex tw-w-full tw-flex-col tw-items-center"
                                >
                                    <img
                                        src={imgSrc}
                                        alt={media.alt[imgIdx]}
                                        className="tw-h-[190px]"
                                    />
                                    <div className="tw-mt-2 tw-text-center tw-text-xs tw-text-gray-500">
                                        {media.alt[imgIdx]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Media description */}
                    <div className="tw-flex tw-flex-1 tw-flex-col tw-gap-2">
                        <ReactMarkdown
                            className="tw-align-text-top"
                            components={{
                                a: overWriteA,
                                em: overwriteEm,
                                img: overwriteInfoImg,
                            }}
                        >
                            {media.description}
                        </ReactMarkdown>
                        {/* Media visit note */}
                        {media.visit_note && (
                            <ReactMarkdown
                                className="tw-align-text-top"
                                components={{
                                    a: overWriteA,
                                    em: overwriteEm,
                                    img: overwriteInfoImg,
                                }}
                            >
                                {media.visit_note}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Requirement;
