/* rce-io-translator.es6 */
// import * as store from '../store';
// import { rceIO } from './rce-io';
import { hw as leds } from '../hardware/leds';

/**
 * Handle incomming messages of type data
 * @param  {Object} message The incomming message
 */
export function onData(message) {
  switch (message.data.storeName) {
    case 'control':
      if (message.data.path === 'testLED.isOn') {
        if (message.data.data.newValue) {
          leds.indicator.on();
        } else {
          leds.indicator.off();
        }
      }
      break;
    case 'server':
      // if ()
      break;
    default:
  }
}
