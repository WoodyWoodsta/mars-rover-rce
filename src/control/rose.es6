/* rose.es6 */
/**
 * Control process startpoint for incomming 'rose' control from the client
 */

import * as store from '../store';
import * as dispatch from './dispatch';

/**
 * Initialise interactive control listeners
 */
export function init() {
  store.rceState.on('controller.sequenceState-changed', _seqStateRelay);
}

/**
 * De-initialise interactive control listeners
 */
export function deinit() {
  store.rceState.removeListener('controller.sequenceState-changed', _seqStateRelay);
}

// === Private ===
function _seqStateRelay(event) {
  if (event.newValue === 'running') {
    console.log('Dispatching sequence command');
    dispatch.tempCmdTrans({
      params: {
        value: 1,
        duration: 5000,
      },
      callback: () => {
        console.log('The command has executed!');
        store.rceState.set('controller.sequenceState', 'off');
      },
    });
  }
}
