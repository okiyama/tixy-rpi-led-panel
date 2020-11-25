import {
    GpioMapping,
    LedMatrix,
} from 'rpi-led-matrix';

export const matrixOptions = Object.assign(Object.assign({}, LedMatrix.defaultMatrixOptions()), {
    rows: 32,
    cols: 32,
    chainLength: 1,
    hardwareMapping: GpioMapping.Regular
});

export const runtimeOptions = Object.assign(Object.assign({}, LedMatrix.defaultRuntimeOptions()), {
    gpioSlowdown: 0
});

