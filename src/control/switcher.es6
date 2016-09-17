/* switcher.es6 */
/**
 * Handles client switching control types
 */

import debug from 'debug';

import * as store from '../store';
import * as interactive from './interactive';

const log = debug('rce:control-switcher');

store.control.on('type-changed', _onControlTypeChanged);

// === Private ===
function _onControlTypeChanged(event) {
  if (event.newValue === 'interactive' && event.oldValue !== 'interactive') {
    if (event.oldValue === 'rose') {
      // TODO: De-initialise RoSE control
    }

    // Init interactive control
    interactive.init();
    log('Interactive control initialised');
  } else if (event.newValue === 'rose' && event.oldValue !== 'rose') {
    if (event.oldValue === 'interactive') {
      interactive.deinit();
    }

    // Init RoSE control
    log('RoSE control initialised');
  }
}
