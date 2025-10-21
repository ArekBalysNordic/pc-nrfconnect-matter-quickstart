/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
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
    title: 'nRF54L Series – nRF54LM20 DK',
    dkImage: '../resources/devices/images/54LM20DK.png',
    dkTechnologiesImage: '../resources/devices/images/DKTech.png',
    SoCDescription:
        'nRF54LM20A is part of the nRF54L Series. All wireless System-on-Chip (SoC) options in the series integrate an ultra-low-power, multiprotocol 2.4-GHz radio and MCU functionality featuring a 128-MHz Arm Cortex-M33 processor. The nRF54LM20A features an extended peripheral set, high-speed USB, increased memory size with 2036 KB NVM and 512 KB RAM, and up to 66 GPIOs.',
    additionalInformation:
        'The multiprotocol 2.4-GHz radio of nRF54LM20A supports Bluetooth® LE with optional features, including Channel Sounding introduced in Bluetooth Core 6.0, as well as 802.15.4-2020 for standards such as Thread, Matter, and Zigbee. It also supports a proprietary 2.4-GHz mode with up to 4 Mbps for higher throughput. For more information, read the [datasheet](https://docs.nordicsemi.com/bundle/ps_nrf54LM20A/page/keyfeatures_html5.html) and visit the [nRF54LM20A SoC](https://www.nordicsemi.com/Products/nRF54LM20A) and the [nRF54LM20 DK](https://www.nordicsemi.com/Products/Development-hardware/nRF54LM20-DK) web pages.',
    documentationLink:
        'https://docs.nordicsemi.com/bundle/ps_nrf54LM20A/page/keyfeatures_html5.html',
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
                file: 'nrf54lm20/nrf54lm20dk_lock.hex',
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
                file: 'nrf54lm20/nrf54lm20dk_light_bulb.hex',
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
                file: 'nrf54lm20/nrf54lm20dk_temperature_sensor.hex',
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
                file: 'nrf54lm20/nrf54lm20dk_contact_sensor.hex',
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
    enablePairingImage: '../resources/devices/images/54LM20DK_pairing.png',
    button: 'Button 0',
} as AdvertisingData;

export default {
    device: 'nRF54LM20 DK',
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
        Interaction({ led: 1, button: 1 }),
        Learn(learnConfig),
        Develop(sampleCommonConfig, matterDevResources),
        Apps(appsCommonConfig),
    ],
};
