import { LedMatrix } from 'rpi-led-matrix';
import { matrixOptions, runtimeOptions } from './_config.js';

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
(async () => {
    try {
        let index = 0;
        const matrix = new LedMatrix(matrixOptions, runtimeOptions);
        const pulsers = [];
        for (let x = 0; x < matrix.width(); x++) {
            for (let y = 0; y < matrix.height(); y++) {
                pulsers.push(new Pulser(x, y));
            }
        }
        matrix.afterSync((mat, dt, t) => {
            console.log(dt);
            pulsers.map(pulser => {
                pulser.calc(t/1000, index);
                matrix
                    .fgColor(pulser.nextColor())
                    .brightness(pulser.brightness())
                    .setPixel(pulser.x, pulser.y);
            });
	    index++;
            setTimeout(() => matrix.sync(), 0);
        });
        matrix.sync();
    }
    catch (error) {
        console.error(error);
    }
})();

