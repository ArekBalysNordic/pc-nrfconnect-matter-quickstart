/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import {
    deviceInfo,
    IssueBox,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { getSelectedDeviceUnsafely } from '../../../features/device/deviceSlice';
import { Back } from '../../Back';
import Main from '../../Main';
import { Next } from '../../Next';
import Verifying from '../../Verifying';
import runVerification from './serialport';
import { getError, getResponse, reset, setError } from './verifySlice';

import './cursor.scss';

export default ({
    vComIndex,
    regex,
    ref,
}: {
    vComIndex: number;
    regex: RegExp;
    ref: string;
}) => {
    const dispatch = useAppDispatch();
    const device = useAppSelector(getSelectedDeviceUnsafely);
    const response = useAppSelector(getResponse);
    const error = useAppSelector(getError);
    const [cleanup, setCleanup] = useState<() => void>();
    const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout>();
    const [validResponse, setValidResponse] = useState<string>();
    const waiting = !error && !validResponse;

    useEffect(() => {
        if (!error && !response) {
            // May receive the end of device output after programming reset if user pressed next too quickly
            setTimeout(() => {
                dispatch(runVerification(device, vComIndex))
                    .then(cl => {
                        setCleanup(() => cl);
                        setErrorTimeout(
                            setTimeout(() => {
                                cl();
                                setErrorTimeout(undefined);
                                dispatch(
                                    setError(
                                        'Timed out or did not receive expected value'
                                    )
                                );
                            }, 5000)
                        );
                    })
                    .catch(e => dispatch(setError(describeError(e))));
            }, 5000);
        }
    }, [dispatch, response, error, device, vComIndex, regex]);

    useEffect(() => {
        if (!validResponse) {
            const [, match] = (response || '').match(regex) ?? [];
            if (match) {
                // Extract Product Name from the response
                const productNameMatch = (response || '').match(
                    /Product Name:\s*(.+)/
                );
                if (productNameMatch) {
                    const productName = productNameMatch[1].trim();
                    // Verify Product Name matches the expected ref value
                    if (productName !== ref) {
                        if (cleanup) cleanup();
                        if (errorTimeout) clearTimeout(errorTimeout);
                        setCleanup(undefined);
                        setErrorTimeout(undefined);
                        dispatch(
                            setError(
                                `Product Name mismatch: Expected "${ref}" but got "${productName}"`
                            )
                        );
                        return;
                    }
                }
                setValidResponse(match);
            }
        }
    }, [response, validResponse, regex, errorTimeout, cleanup, ref, dispatch]);

    useEffect(() => {
        if (validResponse && cleanup && errorTimeout) {
            cleanup();
            clearTimeout(errorTimeout);
            setCleanup(undefined);
            setErrorTimeout(undefined);
        }
    }, [validResponse, cleanup, errorTimeout]);

    const getHeading = () => {
        if (error) {
            return 'Verification failed';
        }
        if (!waiting) {
            return 'Verification successful';
        }
        return 'Verifying';
    };

    const filterAndCleanLogs = (logs: string) => {
        const relevantKeywords = [
            'Serial Number',
            'Vendor Id',
            'Product Id',
            'Product Name',
            'Hardware Version',
            'Setup Pin Code',
            'Setup Discriminator',
        ];

        return logs
            .split('\n')
            .filter(line =>
                relevantKeywords.some(keyword => line.includes(keyword))
            )
            .map(line =>
                // Remove the "I: <number> [DL] " prefix pattern
                line.replace(/^I:\s*\d+\s*\[DL\]\s*/, '')
            )
            .filter(Boolean);
    };

    return (
        <Main>
            <Main.Content heading={getHeading()}>
                {waiting && <Verifying />}
                {validResponse && (
                    <div className="tw-flex tw-flex-col tw-gap-1">
                        <div className="tw-font-medium">
                            Serial output from the sample:
                        </div>
                        <div className="alt-font tw-relative tw-mt-4 tw-bg-gray-700 tw-p-4 tw-text-gray-50">
                            {filterAndCleanLogs(validResponse).map(line => (
                                <p key={line}>{line}</p>
                            ))}
                            <div className="tw-absolute tw-right-4 tw-top-1/2 tw--translate-y-1/2">
                                <span className="mdi mdi-circle tw-top-0.5 tw-z-0 tw-text-4xl tw-text-green" />
                                <span className="mdi-check-bold mdi tw-absolute tw-left-1.5 tw-top-1 tw-z-10 tw-text-2xl tw-text-white" />
                            </div>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="tw-pt-4">
                        <IssueBox
                            mdiIcon="tw-mdi-alert"
                            color="tw-text-red"
                            title={error}
                        />
                    </div>
                )}
            </Main.Content>
            <Main.Footer>
                <Back disabled={waiting} />
                {error ? (
                    <Next label="Retry" onClick={() => dispatch(reset())} />
                ) : (
                    <Next
                        disabled={waiting || !!error}
                        onClick={() => {
                            telemetry.sendEvent('Programmed sample', {
                                sampleName: ref,
                                deviceName: deviceInfo(device).name,
                            });
                        }}
                    />
                )}
            </Main.Footer>
        </Main>
    );
};
