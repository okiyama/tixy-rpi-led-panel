import { LedMatrix } from 'rpi-led-matrix';
import { matrixOptions, runtimeOptions } from './_config.js';
import { default as prompts } from 'prompts';
import { default as fs } from 'fs';

let callbacks = null;
let favorites = null;
let currentCallback = null;
let currentCallbackText = "";
let currentCallbackIndex = 0;
let brightnessFix = false;
let brightnessPercent = 100;
let secondsPerDisplay = 10;
let autoplay = true;
let matrix = null;
let centerFunctions = true;
let speedMultiplier = 1;
let functionsPath = './src/functions.json';

class Pulser {
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
        this.value = null;
        this.normalizedValue = null;
    }
    calc(t) {
        try {
            const centeringAdjustmentX = centerFunctions ? matrix.width() / 4 : 0;
            const centeringAdjustmentY = centerFunctions ? matrix.height() / 4 : 0;
            this.value = Number(currentCallback(t, this.i, this.x - centeringAdjustmentX, this.y - centeringAdjustmentY));
        } catch {
            this.value = 0;
        }
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
        return (Math.abs(brightnessFix ? this.normalizedValue : this.value) * brightnessPercent);
    }
}

function setCallback(callbackIndex) {
    let callback = callbacks[callbackIndex];
    const callbackName = callback["name"];
    const callbackText = callback["callback"];

    setCustomCallback(callbackText, callbackIndex);
}

function setCustomCallback(callbackText, callbackIndex) {
    try {
        currentCallbackIndex = callbackIndex || 0;
        currentCallbackText = callbackText;
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

async function promptCustomFunction() {
    const functionPrompt = {
        type: 'text',
        name: 'customFunction',
        message: '(t, i, x, y) =>',
        onState: state => setCustomCallback(state.value) || true
    };

    let functionResponse = await prompts.prompt(functionPrompt);
}

async function promptChooseFunction() {
    const choices = callbacks.map(cb => {
        return {"title": cb.name, "value": cb.callback};
    });

    const choosePrompt = {
        type: 'select',
        name: 'functionChosen',
        message: 'Choose a function',
        choices: choices
    };

    let response = await prompts.prompt(choosePrompt);

    setCustomCallback(response.functionChosen);
}

function loadCallbacks() {
    let rawdata = fs.readFileSync(functionsPath);
    return JSON.parse(rawdata);
}

async function saveCurrentFunction() {
    let response = await prompts.prompt({
        type: 'text',
        name: 'functionName',
        message: 'What would you like to name your function?',
        validate: value => {
            if(!value || value === "") {
                return "Must provide a name";
            } else if(callbacks.some(c => c.name === value)) {
                return "Name must be unique";
            }

            return true;
        }
    });

    callbacks.unshift({"name": response.functionName, "callback": currentCallbackText});
    fs.writeFile(functionsPath, JSON.stringify(callbacks, null, 2), (err, data) => { if(err) {console.log('error', err);}});
}

async function promptAdjustBrightness() {
    const brightnessPrompts = [{
        type: 'toggle',
        name: 'brightnessFix',
        message: 'Apply brightness fix? This will ensure that brightness works correctly for all functions, but will affect how any functions that use values outside of -1 to +1 display.',
        initial: true,
        active: 'yes',
        inactive: 'no' 
    },
    {
        type: 'number',
        name: 'brightness',
        message: 'What brightness percent?',
        validate: value => value >= 0 && value <= 100 || "Value must be between 0 and 100 percent."
    }];

    let responses = await prompts.prompt(brightnessPrompts);
    brightnessFix = responses.brightnessFix;
    brightnessPercent = responses.brightness;
}


(async () => {
    try {
        callbacks = loadCallbacks();
        setCallback(currentCallbackIndex);

        let i = 0;
        matrix = new LedMatrix(matrixOptions, runtimeOptions);
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
                pulser.calc(t/(1000 / speedMultiplier));
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

            if(autoplay) {
                let newCallbackIndex = Math.floor(t / (1000 * secondsPerDisplay)) % (callbacks.length - 1);
                if(newCallbackIndex != currentCallbackIndex) {
                    currentCallbackIndex = newCallbackIndex;
                    setCallback(currentCallbackIndex);
                }
            }

            setTimeout(() => matrix.sync(), 0);
        });
        matrix.sync();

        while(true) {
            const questions = [
                {
                    type: 'select',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        { title: "Input your own function", value: "customFunction" },
                        { title: "Play next function", value: "goToNext" },
                        { title: "Choose a function to play", value: "chooseFunction" },
                        { title: "Play a random function", value: "goToRandom" },
                        { title: "Toggle autoplay", value: "toggleAutoplay" },
                        { title: "Toggle centering functions", value: "toggleCenterFunctions" },
                        { title: "Adjust brightness", value: "adjustBrightness" },
                        { title: "Set how long to display function before going to next", value: "setInterval" },
                        { title: "Set speed multiplier", value: "setSpeed" },
                        { title: "Save current function", value: "save" },
                        { title: "Display current function", value: "display" },
                        { title: "Favorite current function", value: "favorite" },
                        { title: "Save brightness and speed settings for current function", value: "saveSettings" },
                        { title: "Choose which sets of functions to play", value: "chooseFunctionSet" },
                        { title: "Exit", value: "exit" },
                    ]
                }
            ];

            const response = await prompts(questions);
            const action = response.action;
            if(action === "goToNext") {
                const newIndex = (currentCallbackIndex + 1) % callbacks.length;
                setCallback(newIndex);
                autoplay = false;
            } else if(action === "chooseFunction") {
                autoplay = false;
                await promptChooseFunction();
            } else if(action === "goToRandom") {
                setCallback(Math.floor(Math.random() * callbacks.length));
                autoplay = false;
            } else if(action === "toggleAutoplay") {
                autoplay = !autoplay;
            } else if(action === "toggleCenterFunctions") {
                centerFunctions = !centerFunctions;
            } else if(action === "customFunction") {
                autoplay = false;
                await promptCustomFunction();
            } else if(action === "exit") {
                process.exit();
            } else if(action === "save") {
                autoplay = false;
                await saveCurrentFunction();
            } else if(action === "adjustBrightness") {
                await promptAdjustBrightness();
            } else if(action === "setSpeed") {
                speedMultiplier = (await prompts.prompt({
                    type: 'number',
                    name: 'speed',
                    message: 'What should the speed multiplier be? (e.x. 2 for 2x speed)',
                    float: true,
                    validate: value => value > 0 || "Value must be greater than 0"
                })).speed;
            } else if(action === "setInterval") {
                secondsPerDisplay = (await prompts.prompt({
                    type: 'number',
                    name: 'interval',
                    message: 'How many seconds to play each function?',
                    validate: value => value > 0 || "Value must be greater than 0"
                })).interval;
            } else if(action === "display") {
                console.log("Now running "+ currentCallbackText + "\"");
            } else {
                console.log(action + " not yet implemented");
            }
        }
	 

    }
    catch (error) {
        console.error(error);
    }
})();

