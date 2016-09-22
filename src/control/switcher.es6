/* switcher.es6 */
/**
 * Handles client switching control types
 */

import debug from 'debug';

import * as store from '../store';
import * as interactive from './interactive';
import * as rose from './rose';
import * as leds from '../hardware/leds';

const log = debug('rce:control-switcher');

store.control.on('type-changed', _onControlTypeChanged);

// === Private ===
/**
 * Switch the control type when the client changes it
 * @param  {Object} event The incomming property change event
 */
function _onControlTypeChanged(event) {
  if (event.newValue === 'interactive' && event.oldValue !== 'interactive') {
    if (event.oldValue === 'rose') {
      rose.deinit();
    }

    // Init interactive control
    interactive.init();
    log('Interactive control initialised');
  } else if (event.newValue === 'rose' && event.oldValue !== 'rose') {
    if (event.oldValue === 'interactive') {
      interactive.deinit();
    }

    // Init RoSE control
    rose.init();
    log('RoSE control initialised');
  }
}
