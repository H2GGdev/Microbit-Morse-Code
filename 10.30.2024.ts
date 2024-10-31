// Translate the accumulated Morse code into letters (shown in Button A press)
function translateMorse(morseArray: any[]) {
    morseCode.forEach(symbol => {
        if (symbol === ".") {
            music.playTone(550, music.beat(BeatFraction.Quarter)); // Short beep for dot
            pins.digitalWritePin(DigitalPin.P1, 1);
            basic.pause(500);
            pins.digitalWritePin(DigitalPin.P1, 0);
        } else if (symbol === "-") {
            music.playTone(550, music.beat(BeatFraction.Half)); // Longer beep for dash
            pins.digitalWritePin(DigitalPin.P1, 1);
            basic.pause(1000);
            pins.digitalWritePin(DigitalPin.P1, 0);
        } else {
            basic.pause(1000);  // Pause for space between words
        }
        basic.pause(500);  // Pause between signals
    });
    morseArray.forEach(symbol => {
        if (symbol === " ") {
            translatedMessage += ref[currentLetter] || "?";
            currentLetter = "";
        } else {
            currentLetter += symbol;
        }
    });
    if (currentLetter) {
        translatedMessage += ref[currentLetter] || "?";
    }
    return translatedMessage;
}

let isButtonBActive = false;
let timeInput = 0;
let isButtonAActive = false;
let timeInputInit = 0;
let fullMessage = "";
let morseCode: string[] = [];
let translatedMessage = "";
let currentLetter = "";
const ref: { [key: string]: string } = {
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
};

// Adjust these to reflect actual T timings (1T, 3T, 7T)
let possibleVals = [1000, 3000, 7000];
let timeConstant = 1000;

basic.forever(function () {
    timeInputInit = input.runningTime();
    basic.clearScreen();

    // Detect press and hold for Morse code entry
    if ((pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A)) && !isButtonAActive) {
        isButtonAActive = true;
        while (pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A)) {
            // Indicate input is happening
            basic.showNumber(0);
            timeInput = input.runningTime() - timeInputInit;
        }
        // Detect dot or dash based on duration
        if (timeInput < 2000) {
            morseCode.push(".");
            basic.showString(".");
        } else if (timeInput < 4000) {
            morseCode.push("-");
            basic.showString("-");
        } else {
            morseCode.push(" ");
        }
        basic.pause(100);
    } else if (!(pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A))) {
        isButtonAActive = false;
    }

    // Button B: Play Morse code transmission and log translated message
    if ((pins.digitalReadPin(DigitalPin.P1) == 1 || input.buttonIsPressed(Button.B)) && !isButtonBActive) {
        isButtonBActive = true;
        fullMessage = translateMorse(morseCode);
        console.log("Current Message: " + fullMessage);

        /*morseCode.forEach(symbol => {
            if (symbol === ".") {
                music.playTone(550, music.beat(BeatFraction.Quarter)); // Short beep for dot
                pins.digitalWritePin(DigitalPin.P1, 1);
                basic.pause(500);
                pins.digitalWritePin(DigitalPin.P1, 0);
            } else if (symbol === "-") {
                music.playTone(550, music.beat(BeatFraction.Half)); // Longer beep for dash
                pins.digitalWritePin(DigitalPin.P1, 1);
                basic.pause(1000);
                pins.digitalWritePin(DigitalPin.P1, 0);
            } else {
                basic.pause(1000);  // Pause for space between words
            }
            basic.pause(500);  // Pause between signals
        });*/

        // Reset after playing the message
        morseCode = [];
    } else if (!(pins.digitalReadPin(DigitalPin.P1) == 1 || input.buttonIsPressed(Button.B))) {
        isButtonBActive = false;
    }

    // Check if Pin 2 is pressed along with Button B
    if (pins.digitalReadPin(DigitalPin.P2) == 1 && isButtonBActive) {
        fullMessage = translateMorse(morseCode);
        console.log("Full Message on B + Pin 2: " + fullMessage);

        // Reset after translation
        morseCode = [];
    }
});

