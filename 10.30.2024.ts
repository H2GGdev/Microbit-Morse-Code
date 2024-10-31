// Translate the accumulated Morse code into letters
function translateMorse(morseArray: string[]): string {
    let translatedMessage = ""; // Reset translatedMessage at the start
    let currentLetter = ""; // Reset currentLetter at the start

    morseArray.forEach(symbol => {
        if (symbol === "EOL") {
            // Translate accumulated Morse to letter and add to translatedMessage
            translatedMessage += ref[currentLetter] || "?";
            console.log(`Translated ${currentLetter} to ${ref[currentLetter] || "?"}`);
            currentLetter = ""; // Reset currentLetter after adding to translatedMessage
        } else {
            currentLetter += symbol; // Accumulate current Morse code for letter
        }
    });

    // Append the last letter if it exists
    if (currentLetter) {
        translatedMessage += ref[currentLetter] || "?"; // Translate last letter
        console.log(`Translated ${currentLetter} to ${ref[currentLetter] || "?"}`);
    }

    console.log(`Full translated message: ${translatedMessage}`);
    return translatedMessage; // Return the translated message
}

let isButtonBActive = false;
let isButtonBHeld = false;
let buttonBHoldStart = 0; // To track when Button B is pressed
let timeInput = 0;
let isButtonAActive = false;
let timeInputInit = 0;
let fullMessage = ""; // Track full message
let untranslatedMessage = ""; // Track untranslated Morse code with dots
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
            fullMessage += "."; // Add to fullMessage
            untranslatedMessage += "."; // Add to untranslatedMessage
            basic.showString(".");
        } else if (timeInput < 4000) {
            morseCode.push("-");
            fullMessage += "-"; // Add to fullMessage
            untranslatedMessage += "-"; // Add to untranslatedMessage
            basic.showString("-");
        } else {
            morseCode.push("EOW"); // Use "EOW" to signify end of letter
            fullMessage += "EOW"; // Add to fullMessage
            untranslatedMessage += " "; // Add space to untranslatedMessage
        }
        
        basic.pause(100);
    } else if (!(pins.digitalReadPin(DigitalPin.P0) == 1 || input.buttonIsPressed(Button.A))) {
        isButtonAActive = false;
    }

    // Button B: Play Morse code transmission and log translated message
    if ((pins.digitalReadPin(DigitalPin.P1) == 1 || input.buttonIsPressed(Button.B))) {
        if (!isButtonBActive) {
            buttonBHoldStart = input.runningTime(); // Start the hold timer
            isButtonBActive = true;
        }
        // Check if button is held for more than 3 seconds
        if (input.runningTime() - buttonBHoldStart > 3000) {
            isButtonBHeld = true;
        }
    } else {
        // Button B is released
        if (isButtonBActive) {
            if (isButtonBHeld) {
                // Translate the full message and log it
                morseCodeT.forEach((segment, index) => {
                    console.log(`Segment ${index + 1}: ${segment}`);
                });
                /*let fullTranslatedMessage = morseCodeT
                console.log("Full Message: " + fullTranslatedMessage); // Print the entire accumulated message
                console.log("Untranslated Message: " + untranslatedMessage); // Print untranslated Morse code*/
            } else {
                morseCodeT.push(translateMorse(morseCode))
                let translatedMessage = translateMorse(morseCode); // Translate the Morse code if not held
                console.log("Current Message: " + translatedMessage); // Log the translated message
                console.log("Untranslated Message: " + untranslatedMessage); // Log untranslated Morse code
                untranslatedMessage += "EOL"; // Add dot between characters for untranslatedMessage
            }

            // Play the Morse code
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
                } else if (symbol === "EOL") {
                    basic.pause(1000);  // Pause for space between letters
                }
                basic.pause(500);  // Pause between signals
            });

            // Reset morseCode after playing the message, but keep the fullMessage for the next press
            morseCode = []; // Clear morseCode
            isButtonBActive = false;
            isButtonBHeld = false; // Reset held state for the next press
        }
    }

    // Check if Pin 2 is pressed along with Button B
    if (pins.digitalReadPin(DigitalPin.P2) == 1 && isButtonBActive) {
        const fullMessageOnBPlusPin2 = fullMessage; // Use the fullMessage for Pin 2
        console.log("Full Message on B + Pin 2: " + fullMessageOnBPlusPin2); // Log message on Pin 2

        // Reset morseCode after translation
        morseCode = []; // Clear morseCode
    }
});
