import { LedMatrix } from 'rpi-led-matrix';
import { matrixOptions, runtimeOptions } from './_config.js';

import { default as callbacks } from "./internet_examples.json";

let currentCallback = null;

class Pulser {
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
        this.value = null;
    }
    calc(t) {
        this.value = Number(currentCallback(t, this.i, this.x, this.y));
    }
    color() {
        if(this.value < 0) {
            return 0xFF0000;
        } else {
            return 0xFFFFFF;
        }
    }
    brightness() {
        return (Math.abs(this.value) * 100) / 2;
    }
}

function setCallback(callbackText) {
    try {
        currentCallback = new Function('t', 'i', 'x', 'y', `
        try {
            with (Math) {
                return ${callbackText.replace(/\\/g, ';')};
            }
        } catch (error) {
            return error;
        }
        `);
    } catch (error) {
        currentCallback = null;
    }
}

(async () => {
    try {
        let callback = callbacks[Math.floor(Math.random() * callbacks.length)];
        const callbackName = callback["name"];
        const callbackText = callback["callback"];
        console.log("Now running \"" + callbackName + "\". Callback is: \"" + callbackText + "\"");

		setCallback(callbackText);

        let i = 0;
        const matrix = new LedMatrix(matrixOptions, runtimeOptions);
        const pulsers = [];
        for (let x = 0; x < matrix.width(); x++) {
            for (let y = 0; y < matrix.height(); y++) {
                pulsers.push(new Pulser(x, y, i));
                i++;
            }
        }
        matrix.afterSync((mat, dt, t) => {
//            console.log(dt);
            pulsers.map(pulser => {
                pulser.calc(t/500);
                matrix
                    .fgColor(pulser.color())
                    .brightness(pulser.brightness())
                    .setPixel(pulser.x, pulser.y);
            });
            setTimeout(() => matrix.sync(), 0);
        });
        matrix.sync();
    }
    catch (error) {
        console.error(error);
    }
})();

