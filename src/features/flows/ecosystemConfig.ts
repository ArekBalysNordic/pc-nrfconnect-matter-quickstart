/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface EcosystemConfig {
    name: string;
    description: string;
    link: string;
    pairingImage: string;
    pairingManual: string;
}

let selectedEcosystem: EcosystemConfig;

export const ecosystemConfig: EcosystemConfig[] = [
    {
        name: 'Apple Home',
        description: 'Work with Apple Home',
        link: 'https://www.apple.com/home-app/',
        pairingImage: '../resources/ecosystems/Apple/apple_home_app.png',
        pairingManual: 'https://support.apple.com/en-us/104998',
    },
    {
        name: 'Google Home',
        description: 'Work with Google Home',
        link: 'https://home.google.com/welcome/',
        pairingImage: '../resources/ecosystems/Google/google_home_app.png',
        pairingManual:
            'https://support.google.com/googlenest/answer/9159862?hl=en',
    },
    {
        name: 'Amazon Alexa',
        description: 'Work with Amazon Alexa',
        link: 'https://www.amazon.com/Alexa-App/b?ie=UTF8&node=18354642011',
        pairingImage: '../resources/ecosystems/Amazon/amazon_alexa_app.png',
        pairingManual:
            'https://www.amazon.com/gp/help/customer/display.html?nodeId=G3RKPNRKF33ECTW7',
    },
    {
        name: 'SmartThings',
        description: 'Work with SmartThings',
        link: 'https://www.samsung.com/uk/smartthings/app/',
        pairingImage:
            '../resources/ecosystems/SmartThings/smart_things_app.png',
        pairingManual:
            'https://support.smartthings.com/hc/en-us/articles/360052390111-Devices-in-SmartThings',
    },
];

export const getSelectedEcosystem = (): EcosystemConfig => selectedEcosystem;

export const setSelectedEcosystem = (ecosystem: EcosystemConfig) => {
    selectedEcosystem = ecosystem;
};
