/* board.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import Edison from 'edison-io';

const log = debug('rce:board');

export const board = new five.Board({
  io: new Edison(),
  repl: false,
});

export function init() {
  log('Setting up Edison board...');

  board.on('ready', () => {
    log('Board ready');
  });
}
