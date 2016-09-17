/* board.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import Edison from 'edison-io';

import * as store from '../store';
const log = debug('rce:board');

export let board;

export function init() {
  log('Setting up Edison board...');

  board = new five.Board({
    io: new Edison(),
    repl: false,
  })
  .on('ready', () => {
    store.hardwareState.set('board.initialised', true);
    log('Board ready');
  });
}
