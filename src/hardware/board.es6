/* board.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';
import * as five from 'johnny-five';
import Edison from 'edison-io';

import * as store from '../store';

const log = debug('rce:board');

export let board;

/**
 * Initialise the `Board` instance
 */
export function init() {
  log('Setting up Edison board...');

  board = new five.Board({
    io: new Edison(),
    repl: false,
  })
  .on('ready', () => {
    // Update
    store.hardwareState.set('board.initialised', true);
    log('Board ready');
  });
}
