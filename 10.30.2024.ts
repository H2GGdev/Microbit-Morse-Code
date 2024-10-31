function translateMorse(morseArray: string[]): string {
    let translatedMessage = "";
    let currentLetter = "";

    morseArray.forEach(symbol => {
        if (symbol === "EOL") {
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
let isButtonBHeld = false;
let buttonBHoldStart = 0;
let timeInput = 0;
let isButtonAActive = false;
let timeInputInit = 0;
let fullMessage = "";
let untranslatedMessage = "";
let morseCode: string[] = [];
let morseCodeT: string[] = [];
const ref: { [key: string]: string } = {
    "EOW": " ",
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

let possibleVals = [1000, 3000, 7000];
let timeConstant = 1000;

basic.forever(function () {
    timeInputInit = input.runningTime();
    basic.clearScreen();

    if ((pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A)) && !isButtonAActive) {
        isButtonAActive = true;
        while (pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A)) {
            basic.showNumber(0);
            timeInput = input.runningTime() - timeInputInit;
        }
        if (timeInput < 2000) {
            morseCode.push(".");
            fullMessage += ".";
            untranslatedMessage += ".";
            basic.showString(".");
        } else if (timeInput < 4000) {
            morseCode.push("-");
            fullMessage += "-";
            untranslatedMessage += "-";
            basic.showString("-");
        } else {
            morseCode.push("EOW");
            fullMessage += "EOW";
            untranslatedMessage += " ";
        }

        basic.pause(100);
    } else if (!(pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A))) {
        isButtonAActive = false;
    }

    if ((pins.digitalReadPin(DigitalPin.P1) == 1 || input.buttonIsPressed(Button.B))) {
        if (!isButtonBActive) {
            buttonBHoldStart = input.runningTime();
            isButtonBActive = true;
        }
        if (input.runningTime() - buttonBHoldStart > 3000) {
            isButtonBHeld = true;
        }
    } else {
        if (isButtonBActive) {
            if (isButtonBHeld) {
                morseCodeT.forEach((segment, index) => {
                    console.log(`Segment ${index + 1}: ${segment}`);
                });
            } else {
                morseCodeT.push(translateMorse(morseCode));
                let translatedMessage = translateMorse(morseCode);
                untranslatedMessage += "EOL";
                console.log("Current Message: " + translatedMessage);
                console.log("Untranslated Message: " + untranslatedMessage);
            }

            morseCode.forEach(symbol => {
                if (symbol === ".") {
                    music.playTone(550, music.beat(BeatFraction.Quarter));
                    pins.digitalWritePin(DigitalPin.P1, 1);
                    basic.pause(500);
                    pins.digitalWritePin(DigitalPin.P1, 0);
                } else if (symbol === "-") {
                    music.playTone(550, music.beat(BeatFraction.Half));
                    pins.digitalWritePin(DigitalPin.P1, 1);
                    basic.pause(1000);
                    pins.digitalWritePin(DigitalPin.P1, 0);
                } else if (symbol === "EOL") {
                    basic.pause(1000);
                }
                basic.pause(500);
            });

            morseCode = [];
            isButtonBActive = false;
            isButtonBHeld = false;
        }
    }

    if (pins.digitalReadPin(DigitalPin.P2) == 1 && isButtonBActive) {
        const fullMessageOnBPlusPin2 = fullMessage;
        console.log("Full Message on B + Pin 2: " + fullMessageOnBPlusPin2);
        morseCode = [];
    }
});
