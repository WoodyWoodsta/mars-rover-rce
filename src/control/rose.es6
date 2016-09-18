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
_seqStateRelay(event) {
  
}
