/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';

interface VideoProps {
    mediaSrc: string;
}

const Video = ({ mediaSrc }: VideoProps) => {
    const [isMaximized, setIsMaximized] = useState(false);

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const handleDoubleClick = () => {
        setIsMaximized(true);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (
            event.key === 'Enter' ||
            event.key === ' ' ||
            event.key === 'Escape'
        ) {
            event.preventDefault();
            toggleMaximize();
        }
    };

    return (
        <>
            {/* Maximized video overlay - stays within fixed window (1200x675) */}
            {isMaximized && (
                <div
                    role="button"
                    tabIndex={0}
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black"
                    onClick={toggleMaximize}
                    onKeyDown={handleKeyDown}
                >
                    <video
                        src={mediaSrc}
                        className="tw-h-full tw-w-full tw-object-contain"
                        controls
                        autoPlay
                        loop
                        muted
                        controlsList="nofullscreen"
                    >
                        Your device does not support the video tag.
                    </video>
                    <button
                        className="tw-absolute tw-right-4 tw-top-4 tw-rounded tw-bg-black tw-bg-opacity-50 tw-p-2 tw-text-white hover:tw-bg-opacity-70"
                        onClick={toggleMaximize}
                        type="button"
                        title="Exit maximize"
                    >
                        <span className="mdi mdi-close tw-text-2xl" />
                    </button>
                </div>
            )}

            {/* video container with double-click and custom maximize button */}
            <div className="tw-relative tw-mr-[15px] tw-flex tw-min-w-0 tw-flex-1">
                <video
                    src={mediaSrc}
                    className="tw-rounded-lg tw-object-contain tw-shadow-lg"
                    controls
                    autoPlay
                    loop
                    muted
                    onDoubleClick={handleDoubleClick}
                    controlsList="nofullscreen"
                >
                    Your device does not support the video tag.
                </video>
                {/* Custom maximize button */}
                <button
                    className="tw-absolute tw-right-2 tw-top-2 tw-rounded tw-bg-black tw-bg-opacity-50 tw-p-1 tw-text-white hover:tw-bg-opacity-70"
                    onClick={toggleMaximize}
                    type="button"
                    title="Maximize video"
                >
                    <span className="mdi mdi-fullscreen tw-text-xl" />
                </button>
            </div>
        </>
    );
};

export default Video;
