/* leds.es6 */
import debug from 'debug';
import * as five from 'johnny-five';

import * as store from '../store';

const log = debug('rce:board-leds');

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};

/**
 * Initialise the leds
 */
export function init() {
  hw = {
    indicator: new five.Led(13),
  };

  // Listeners
  store.control.on('testLED.isOn-changed', _onTestLEDIsOnChanged);

  log('LEDs initialised');
  store.hardwareState.set('leds.initialised', true);
}

/**
 * Temporarily blink an led a certain amount of times
 * @param  {Object} ledInst The instance of the led that you want to control
 * @param  {Number} pulse   The pulse width (half-cycle)
 * @param  {Number} counts  The number of cycles
 */
export function tempBlink(ledInst, pulse, counts) {
  let count = 0;

  ledInst.blink(pulse, () => {
    count++;

    if (count === counts * 2) {
      ledInst.stop().off();
      count = 0;
    }
  });
}

// === Private ===
function _onTestLEDIsOnChanged(event) {
  hw.indicator[(event.newValue) ? 'on' : 'off']();
}
