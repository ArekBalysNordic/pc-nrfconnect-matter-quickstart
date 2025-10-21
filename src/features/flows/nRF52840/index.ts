/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
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
    title: 'Versatile single-board development kit',
    dkImage: '../resources/devices/images/52840DK.png',
    dkTechnologiesImage: '../resources/devices/images/DKTech.png',
    SoCDescription:
        'The nRF52840 DK is a versatile single-board development kit for Bluetooth Low Energy, Bluetooth Mesh, Matter, Thread, Zigbee, 802.15.4, ANT and 2.4 GHz proprietary applications on the nRF52840 SoC. It is the recommended Nordic development kit for Amazon Sidewalk. It also supports development on the nRF52811 SoC.',
    additionalInformation:
        'The nRF52840 DK can be used for Matter over Thread where Thread is used for transport and Bluetooth LE for commissioning. Matter devices based on Thread are required to feature Bluetooth LE concurrently to enable adding new devices to a network.',
    documentationLink:
        'https://docs.nordicsemi.com/bundle/ug_nrf52840_dk/page/UG/dk/intro.html',
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
                file: 'nrf52840/nrf52840dk_lock.hex',
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
                file: 'nrf52840/nrf52840dk_light_bulb.hex',
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
                file: 'nrf52840/nrf52840dk_temperature_sensor.hex',
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
                file: 'nrf52840/nrf52840dk_contact_sensor.hex',
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
            vComIndex: 0,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Light Bulb',
        config: {
            vComIndex: 0,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Temperature Sensor',
        config: {
            vComIndex: 0,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
    {
        ref: 'Matter Contact Sensor',
        config: {
            vComIndex: 0,
            regex: /(Using nRF Connect SDK[\s\S]*Init CHIP stack[\s\S]*Device Configuration:[\s\S]*Setup Discriminator \(0xFFFF for UNKNOWN\/ERROR\): 3840 \(0xF00\))/,
        },
    },
];

const learnConfig = [
    ...commonLearningResources,
    {
        label: 'Developing with nRF52 Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF52 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf52/index.html',
        },
    },
];

const advertisingData = {
    enablePairingImage: '../resources/devices/images/52840DK_pairing.png',
    button: 'Button 1',
} as AdvertisingData;

export default {
    device: 'nRF52840 DK',
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
        Interaction({ led: 2, button: 1 }),
        Learn(learnConfig),
        Develop(sampleCommonConfig, matterDevResources),
        Apps(appsCommonConfig),
    ],
};
