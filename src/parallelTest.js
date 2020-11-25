import { LedMatrix } from 'rpi-led-matrix';
import { matrixOptions, runtimeOptions } from './_config.js';
import Parallel from 'paralleljs';

const callback = (t, i, x, y) => Math.sin(y/8 + t);

class Pulser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.value = null;
    }
    calc(t, i) {
        this.value = callback(t, i, this.x, this.y);
    }
    nextColor() {
        if(this.value < 0) {
            return 0xFF0000;
        } else {
            return 0xFFFFFF;
        }
    }
    brightness() {
        return Math.abs(this.value) * 100;
    }
}

const pixelCalcer = function(t, i, x, y) {
    let value = callback(t, i, x, y);
    let color = this.value < 0 ? 0xFF0000 : 0xFFFFFF;
    let brightness = Math.abs(value) * 100;

    let toRet = [color, brightness, x, y];
    console.log(toRet);
    return toRet;
}

const matrix = new LedMatrix(matrixOptions, runtimeOptions);

const matrixValueSetter = function(values) {
    console.log("values " + values);
    console.log("argument " + arguments);
    console.log("argument[0] " + arguments[0]);
    console.log("argument[1] " + arguments[1]);
    console.log("argument[2] " + arguments[2]);
    console.log("argument[3] " + arguments[3]);
    matrix
        .fgColor(values[0])
        .brightness(values[1])
        .setPixel(values[2], values[3]);
}

const log = function () { console.log(arguments); };

(async () => {
    try {
        let index = 0;
        const data= [];
        for (let x = 0; x < matrix.width(); x++) {
            for (let y = 0; y < matrix.height(); y++) {
                data.push([0, index, x, y]);
            }
        }
        matrix.afterSync((mat, dt, t) => {
            console.log(dt);

            //data.forEach(element => {element[0] = index; element[1] = t/1000;});
            //console.log(data);
            //let p = new Parallel(data);
            //p.map(pixelCalcer).then(log);

            index++;
            setTimeout(() => matrix.sync(), 0);
        });
        matrix.sync();
    }
    catch (error) {
        console.error(error);
    }
})();

