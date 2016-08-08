/* board.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import Edison from 'edison-io';

const log = debug('rce:board');

const board = new five.Board({
  io: new Edison(),
});

export default function init() {
  log('Setting up Edison board...');

  board.on('ready', () => {
    const led = new five.Led(13);
    led.blink();
  });
}
