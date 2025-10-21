/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Verify from '../../../common/steps/5xFamilyVerify';
import Apps from '../../../common/steps/Apps';
import Develop from '../../../common/steps/develop';
import EcosystemRequirements from '../../../common/steps/EcosystemRequirements';
import EcosystemSetup from '../../../common/steps/EcosystemSetup';
import EnableAdvertising from '../../../common/steps/EnableAdvertising';
import Info from '../../../common/steps/Info';
import Interaction from '../../../common/steps/Interaction';
import Learn from '../../../common/steps/Learn';
import Pairing from '../../../common/steps/Pairing';
import Program from '../../../common/steps/program';
import Rename from '../../../common/steps/Rename';
import SelectEcosystem from '../../../common/steps/SelectEcosystem';
import { Choice } from '../../device/deviceSlice';
import {
    appsCommonConfig,
    commonLearningResources,
    matterDevResources,
    sampleCommonConfig,
} from '../commonResources';
import { AdvertisingData } from '../pairingConfig';

const infoConfig = {
    title: 'Next-level multiprotocol SoC',
    dkImage: '../resources/devices/images/54L15DK.png',
    dkTechnologiesImage: '../resources/devices/images/DKTech.png',
    SoCDescription:
        'nRF54L15 is the first System-on-Chip (SoC) in the nRF54L Series. It is an ultra-low power Bluetooth 6.0 SoC with a new best-in-class multiprotocol radio and advanced security features.',
    additionalInformation:
        'The nRF54L Series takes the popular nRF52 Series to the next level with excellent processing power and efficiency, expanded memory, and new peripherals, all in a more compact package.',
    documentationLink:
        'https://docs.nordicsemi.com/bundle/ps_nrf54L15/page/keyfeatures_html5.html',
};

const programConfig = [
    {
        name: 'Matter Door Lock',
        type: 'jlink',
        documentation: {
            label: 'Matter Door Lock',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/lock/README.html',
        },
        firmware: [
            {
                core: 'Application',
                file: 'nrf54l15/nrf54l15dk_lock.hex',
                link: {
                    label: 'Matter Door Lock',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/lock/README.html',
                },
            },
        ],
    },
    {
        name: 'Matter Light Bulb',
        type: 'jlink',
        documentation: {
            label: 'Matter Light Bulb',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/light_bulb/README.html',
        },
        firmware: [
            {
                core: 'Application',
                file: 'nrf54l15/nrf54l15dk_light_bulb.hex',
                link: {
                    label: 'Matter Light Bulb',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/light_bulb/README.html',
                },
            },
        ],
    },
    {
        name: 'Matter Temperature Sensor',
        type: 'jlink',
        documentation: {
            label: 'Matter Temperature Sensor',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/temperature_sensor/README.html',
        },
        firmware: [
            {
                core: 'Application',
                file: 'nrf54l15/nrf54l15dk_temperature_sensor.hex',
                link: {
                    label: 'Matter Temperature Sensor',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/temperature_sensor/README.html',
                },
            },
        ],
    },
    {
        name: 'Matter Contact Sensor',
        type: 'jlink',
        documentation: {
            label: 'Matter Contact Sensor',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/contact_sensor/README.html',
        },
        firmware: [
            {
                core: 'Application',
                file: 'nrf54l15/nrf54l15dk_contact_sensor.hex',
                link: {
                    label: 'Matter Contact Sensor',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/contact_sensor/README.html',
                },
            },
        ],
    },
] as Choice[];

const verifyConfig = [
    {
        ref: 'Matter Door Lock',
        config: {
            vComIndex: 1,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Light Bulb',
        config: {
            vComIndex: 1,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Temperature Sensor',
        config: {
            vComIndex: 1,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Contact Sensor',
        config: {
            vComIndex: 1,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
];

const learnConfig = [
    ...commonLearningResources,
    {
        label: 'Developing with nRF54L Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF54L Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf54l/index.html',
        },
    },
];

const advertisingData = {
    enablePairingImage: '../resources/devices/images/54L15DK_pairing.png',
    button: 'Button 0',
} as AdvertisingData;

export default {
    device: 'nRF54L15 DK',
    programConfig,
    learnConfig,
    advertisingData,
    flow: [
        Info(infoConfig),
        Rename(),
        Program(programConfig, sampleCommonConfig),
        Verify(verifyConfig),
        SelectEcosystem(),
        EcosystemRequirements(),
        EcosystemSetup(),
        EnableAdvertising(advertisingData),
        Pairing(),
        Interaction({ led: 1, button: 0 }),
        Learn(learnConfig),
        Develop(sampleCommonConfig, matterDevResources),
        Apps(appsCommonConfig),
    ],
};
