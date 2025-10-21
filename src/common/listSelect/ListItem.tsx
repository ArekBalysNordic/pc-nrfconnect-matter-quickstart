/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

interface ListItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    rightContent?: React.ReactNode;
}

const invokeIfSpaceOrEnterPressed =
    (onClick: React.KeyboardEventHandler<Element>) =>
    (event: React.KeyboardEvent) => {
        event.stopPropagation();
        if (event.key === ' ' || event.key === 'Enter') {
            onClick(event);
        }
    };

const blurAndInvoke =
    (
        onClick: React.MouseEventHandler<HTMLElement>
    ): React.MouseEventHandler<HTMLElement> =>
    (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        event.currentTarget.blur();
        onClick(event);
    };

export const ListItem = ({
    children,
    onClick,
    rightContent,
}: ListItemProps) => {
    if (onClick) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={blurAndInvoke(() => onClick())}
                onKeyUp={invokeIfSpaceOrEnterPressed(() => onClick())}
                className="tw-flex tw-w-full tw-cursor-pointer tw-flex-row tw-items-center tw-justify-between tw-gap-px tw-bg-gray-50 tw-p-4 tw-text-gray-700"
            >
                <div>{children}</div>
                {rightContent}
            </div>
        );
    }

    return (
        <div className="tw-flex tw-w-full tw-flex-row tw-items-center tw-justify-between tw-gap-px tw-p-4 tw-text-gray-700">
            <div>{children}</div>
            {rightContent}
        </div>
    );
};
