/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    apps,
    Button,
    openWindow,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { useAppSelector } from '../app/store';
import { getSelectedDeviceUnsafely } from '../features/device/deviceSlice';
import Link from './Link';

interface Link {
    label: string;
    href: string;
}

export interface ResourceProps {
    label: string;
    description: string;
    link: Link;
}

export interface ResourcesWithdDownloadAndGuide {
    label: string;
    description: string;
    downloadLink?: Link;
    guideLink: Link;
    buttonLabel?: string;
}

export const Resource = ({ label, description, link }: ResourceProps) => (
    <div>
        <b>{label}</b>
        <br />
        {description}
        <div className="tw-pt-0.5 tw-text-xs">
            <Link label={link.label} href={link.href} color="tw-text-primary" />
        </div>
    </div>
);

export const ResourceWithDownloadAndGuide = ({
    label,
    description,
    downloadLink,
    guideLink,
    buttonLabel = 'Download',
}: ResourcesWithdDownloadAndGuide) => {
    const onClickDownload = () => {
        if (downloadLink) {
            window.open(downloadLink.href, '_blank');
        }
    };
    return (
        <div className="tw-flex tw-flex-row tw-items-center tw-justify-between tw-gap-10">
            <div className="tw-w-[600px]">
                <div>
                    <b>{label}</b>
                </div>
                {description}
                <div className="tw-pt-0.5 tw-text-xs">
                    <Link
                        label={guideLink.label}
                        href={guideLink.href}
                        color="tw-text-primary"
                    />
                </div>
            </div>
            <Button
                variant="link-button"
                size="xl"
                onClick={onClickDownload}
                className="tw-w-[250px] tw-shrink-0"
            >
                {buttonLabel}
            </Button>
        </div>
    );
};

interface ResourceWithButtonProps {
    title: string;
    description: string | React.ReactNode;
    buttonLabel: string;
    onClick: () => void;
    links?: Link[];
    disabled?: boolean;
}

export const ResourceWithButton = ({
    title,
    description,
    links,
    buttonLabel,
    disabled,
    onClick,
}: ResourceWithButtonProps) => (
    <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4 tw-py-2">
        <div className="tw-flex tw-flex-1 tw-flex-row tw-items-start tw-justify-start">
            <div className="tw-w-64 tw-flex-shrink-0 tw-pr-5">
                <b>{title}</b>
            </div>
            <div className="tw-flex tw-max-w-[650px] tw-flex-col">
                {description}
                {links?.map(({ label, href }) => (
                    <div key={label} className="tw-pt-0.5 tw-text-xs">
                        <Link
                            label={label}
                            href={href}
                            color="tw-text-primary"
                        />
                    </div>
                ))}
            </div>
        </div>
        <div className="tw-ml-4 tw-flex tw-items-center">
            <Button
                variant="link-button"
                size="xl"
                disabled={disabled}
                onClick={onClick}
                className="tw-shrink-0"
            >
                {buttonLabel}
            </Button>
        </div>
    </div>
);

export const AppResourceButton = ({
    description,
    links,
    disabled,
    app,
    vComIndex,
    title,
    onInstallStart,
    onInstallFinish,
}: {
    description: string;
    app: string;
    links?: Link[];
    title?: string;
    disabled?: boolean;
    vComIndex?: number;
    onInstallStart?: () => void;
    onInstallFinish?: () => void;
}) => {
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const [displayName, setDisplayName] = useState(app);
    const [isInstalling, setIsInstalling] = useState(false);
    const path =
        vComIndex !== undefined
            ? device.serialPorts?.[vComIndex]?.comName
            : undefined;

    useEffect(() => {
        apps.getDownloadableApps().then(({ apps: receivedApps }) => {
            const updatedAppInfo = receivedApps.find(a => a.name === app);
            setDisplayName(updatedAppInfo?.displayName || app);
        });
    }, [app]);

    return (
        <div className="tw-flex tw-flex-row tw-items-start tw-justify-between tw-gap-4 tw-py-2">
            <div className="tw-flex tw-flex-1 tw-flex-row tw-items-start tw-justify-start">
                <div className="tw-w-64 tw-flex-shrink-0 tw-pr-5">
                    <b>{title || displayName}</b>
                </div>
                <div className="tw-flex tw-max-w-[650px] tw-flex-col">
                    {description}
                    {links?.map(({ label, href }) => (
                        <div key={label} className="tw-pt-0.5 tw-text-xs">
                            <Link
                                label={label}
                                href={href}
                                color="tw-text-primary"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="tw-ml-4 tw-flex tw-items-center">
                <Button
                    variant="link-button"
                    size="xl"
                    disabled={disabled || isInstalling}
                    onClick={async () => {
                        const appInfo = await apps
                            .getDownloadableApps()
                            .then(({ apps: receivedApps }) =>
                                receivedApps.find(
                                    a =>
                                        a.name === app &&
                                        a.source === 'official'
                                )
                            );

                        if (appInfo && !apps.isInstalled(appInfo)) {
                            setIsInstalling(true);
                            onInstallStart?.();
                            await apps.installDownloadableApp(appInfo);
                            setIsInstalling(false);
                            onInstallFinish?.();
                        }

                        const deviceOptions = path
                            ? { serialPortPath: path }
                            : { serialNumber: device.serialNumber };

                        openWindow.openApp(
                            {
                                name: app,
                                source: 'official',
                            },
                            {
                                device: deviceOptions,
                            }
                        );

                        telemetry.sendEvent('Opened evaluation app', {
                            app,
                        });
                    }}
                    className="tw-shrink-0"
                >
                    {isInstalling ? 'Installing...' : `Open ${displayName}`}
                </Button>
            </div>
        </div>
    );
};
