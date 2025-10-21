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
    title: 'Dual-core Bluetooth 5.4 SoC',
    dkImage: '../resources/devices/images/5340DK.png',
    dkTechnologiesImage: '../resources/devices/images/DKTech.png',
    SoCDescription:
        'The nRF5340 DK supports development with an extensive range of wireless protocols. It supports Bluetooth® Low Energy with features such as high-throughput 2 Mbps, Advertising Extensions, and Long Range. Mesh protocols (like Bluetooth Mesh, Thread, and Zigbee) can run concurrently with Bluetooth Low Energy, enabling smartphones to provision, commission, configure, and control mesh nodes, which is a prerequisite for [Matter](https://www.nordicsemi.com/Products/Technologies/Matter) applications. The DK also supports NFC, ANT, 802.15.4, and 2.4-GHz proprietary protocols.',
    additionalInformation:
        'The nRF5340 DK is bundled with an NFC antenna that quickly enables testing of nRF5340’s NFC-A tag functionality. The board comes with the SEGGER J-Link debugger, enabling full-blown programming and debugging of both the nRF5340 SoC and external targets.',
    documentationLink:
        'https://docs.nordicsemi.com/bundle/ug_nrf5340_dk/page/UG/dk/intro.html',
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
                file: 'nrf5340/nrf5340dk_lock.hex',
                link: {
                    label: 'Matter Door Lock',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/lock/README.html',
                },
            },
            {
                core: 'Network',
                file: 'nrf5340/nrf5340dk_lock_CPUNET.hex',
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
                file: 'nrf5340/nrf5340dk_light_bulb.hex',
                link: {
                    label: 'Matter Light Bulb',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/light_bulb/README.html',
                },
            },
            {
                core: 'Network',
                file: 'nrf5340/nrf5340dk_light_bulb_CPUNET.hex',
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
                file: 'nrf5340/nrf5340dk_temperature_sensor.hex',
                link: {
                    label: 'Matter Temperature Sensor',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/matter/temperature_sensor/README.html',
                },
            },
            {
                core: 'Network',
                file: 'nrf5340/nrf5340dk_temperature_sensor_CPUNET.hex',
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
                file: 'nrf5340/nrf5340dk_contact_sensor.hex',
            },
            {
                core: 'Network',
                file: 'nrf5340/nrf5340dk_contact_sensor_CPUNET.hex',
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
        label: 'Developing with nRF53 Series',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with nRF53 Series',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/nrf53/index.html',
        },
    },
];

const advertisingData = {
    enablePairingImage: '../resources/devices/images/5340DK_pairing.png',
    button: 'Button 1',
} as AdvertisingData;

export default {
    device: 'nRF5340 DK',
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
