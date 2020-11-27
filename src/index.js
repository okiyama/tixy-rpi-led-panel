import { LedMatrix } from 'rpi-led-matrix';
import { matrixOptions, runtimeOptions } from './_config.js';
import { default as prompts } from 'prompts';

import { default as callbacks } from "./internet_examples.json";

let currentCallback = null;
let brightnessPercent = 100;

class Pulser {
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
        this.value = null;
        this.normalizedValue = null;
    }
    calc(t) {
        this.value = Number(currentCallback(t, this.i, this.x, this.y));
    }
    calcNormalized(minValue, maxValue) {
        this.normalizedValue = (2 * ((this.value - minValue) / (maxValue - minValue))) - 1;
    }
    color() {
        if(this.value < 0) {
            return 0xFF0000;
        } else {
            return 0xFFFFFF;
        }
    }
    brightness() {
        return (Math.abs(this.value) * brightnessPercent);
    }
}

function setCallback(callbackIndex) {
    let callback = callbacks[callbackIndex];
    const callbackName = callback["name"];
    const callbackText = callback["callback"];
    console.log("Now running \"" + callbackName + "\". Callback is: \"" + callbackText + "\"");

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
		setCallback(1);

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
            });

            let minValue = Number.POSITIVE_INFINITY;
            let maxValue = Number.NEGATIVE_INFINITY;

            pulsers.map(pulser => {
                if(pulser.value < minValue) {
                    minValue = pulser.value;
                }
                if(pulser.value > maxValue) {
                    maxValue = pulser.value;
                }
            });

            pulsers.map(pulser => {
                pulser.calcNormalized(minValue, maxValue);
            });

            pulsers.map(pulser => {
                matrix
                    .fgColor(pulser.color())
                    .brightness(pulser.brightness())
                    .setPixel(pulser.x, pulser.y);
            });
            setTimeout(() => matrix.sync(), 0);
        });
        matrix.sync();

        while(true) {
            const questions = [
                {
                    type: 'number',
                    name: 'callbackIndex',
                    message: 'Which callback should I play?',
                    validate: value => value < 0 || value >= callbacks.length ? `Must be between 0 and ${callbacks.length - 1}` : true
                },
                /*
                {
                    type: 'number',
                    name: 'brightnessModifier',
                    message: 'What should the brightness percentage be?',
                    validate: value => value < 0 || value > 100 ? `Must be between 0 and 100` : true
                }*/
            ];

            const response = await prompts(questions);
            setCallback(response.callbackIndex);
            //brightnessPercent = response.brightnessModifier;
        }
	 

    }
    catch (error) {
        console.error(error);
    }
})();

