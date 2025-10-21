/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
import VerifyBootloader from '../../../common/steps/Thingy53Bootloader';
import VerifyPartitions from '../../../common/steps/Thingy53Partitions';
import Verify from '../../../common/steps/Thingy53Verify';
import { Choice } from '../../device/deviceSlice';
import {
    appsCommonConfig,
    commonLearningResources,
    matterDevResources,
    sampleCommonConfig,
} from '../commonResources';
import { AdvertisingData } from '../pairingConfig';

const infoConfig = {
    title: 'Multi-protocol IoT prototyping platform',
    dkImage: '../resources/devices/images/Thingy53.png',
    dkTechnologiesImage: '../resources/devices/images/DKTech.png',
    SoCDescription:
        'The Nordic Thingy:53™ is an easy-to-use IoT prototyping platform. The Thingy:53 is built around the nRF5340 SoC, our flagship dual-core wireless SoC. The Bluetooth Low Energy (LE) radio allows updating firmware and communication over Bluetooth LE, and the radio also supports other protocols like Bluetooth mesh, Thread, Zigbee, and proprietary 2.4 GHz protocols. The Thread protocol compatibility also makes it a great choice when developing products for the new Matter ecosystem.',
    additionalInformation:
        'The Thread protocol compatibility also makes it a great choice when developing products for the new Matter ecosystem.',
    documentationLink:
        'https://docs.nordicsemi.com/bundle/ug_thingy53/page/UG/thingy53/intro/frontpage.html',
};

const programConfig = [
    {
        name: 'Matter Weather Station',
        type: 'buttonless-dfu',
        description:
            'This weather station application demonstrates the usage of the Matter application layer to build a weather station device using the Nordic Thingy:53. Such a device lets you remotely gather different kinds of data using the device sensors, such as temperature, air pressure, and relative humidity. You can use this sample as a reference for creating your application. This device works as a Matter accessory device, meaning it can be paired and controlled remotely over a Matter network built on top of a low-power 802.15.4 Thread network.',
        documentation: {
            label: 'Matter Weather Station',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/matter_weather_station/README.html',
        },
        firmware: [
            {
                core: 'Application',
                file: 'thingy53/thingy53_matter_weather_station.zip',
                link: {
                    label: 'Matter Weather Station',
                    href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/applications/matter_weather_station/README.html',
                },
            },
        ],
    },
] as Choice[];

const verifyConfig = {
    settings: [
        {
            ref: 'Start prototyping',
            vComIndex: 0,
            mode: 'SHELL' as const,
        },
    ],
    commands: [
        {
            title: 'matter config',
            command: 'matter config',
            responseRegex:
                /(VendorId:[\s\S]*ProductId:[\s\S]*HardwareVersion:[\s\S]*PinCode:[\s\S]*Discriminator:[\s\S]*)Done/s,
        },
    ],
};

const learnConfig = [
    ...commonLearningResources,
    {
        label: 'Developing with Thingy:53',
        description:
            'Device-specific information about features, DFU solution, and development.',
        link: {
            label: 'Developing with Thingy:53',
            href: 'https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/app_dev/device_guides/thingy53/index.html',
        },
    },
];

const advertisingData = {
    enablePairingImage: '../resources/devices/images/Thingy53_pairing.png',
    button: 'Middle Button',
} as AdvertisingData;

export default {
    device: 'Nordic Thingy:53',
    programConfig,
    learnConfig,
    advertisingData,
    flow: [
        Info(infoConfig),
        Rename(),
        VerifyPartitions(),
        VerifyBootloader(),
        Program(programConfig, sampleCommonConfig),
        Verify(verifyConfig),
        SelectEcosystem(),
        EcosystemRequirements(),
        EcosystemSetup(),
        EnableAdvertising(advertisingData),
        Pairing(),
        Interaction({}),
        Learn(learnConfig),
        Develop(sampleCommonConfig, matterDevResources),
        Apps(appsCommonConfig),
    ],
};
