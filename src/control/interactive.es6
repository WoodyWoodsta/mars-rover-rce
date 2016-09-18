/* interactive.es6 */
/**
 * Control process startpoint for incomming 'interactive' control from the client
 */

import * as store from '../store';
import * as dispatch from './dispatch';

export function init() {
  // Setup listeners
  store.control.on('driveInput-changed', _driveInputRelay);
}

export function deinit() {
  // Remove listeners
  store.control.removeListener('driveInput-changed', _driveInputRelay);
}

// Interactive Relays
function _driveInputRelay(event) {
  const direction = (event.newValue.yMag < 0) ? 'rev' : 'fwd';

  dispatch.driveCmdTrans({
    params: {
      arc: event.newValue.xMag,
      velocity: Math.abs(event.newValue.yMag),
      direction,
    },
  });
}
