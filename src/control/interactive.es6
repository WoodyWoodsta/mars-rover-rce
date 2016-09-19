/* interactive.es6 */
/**
 * Control process startpoint for incomming 'interactive' control from the client
 */
import * as store from '../store';
import * as dispatch from './dispatch';

/**
 * Initialise interactive control listeners
 */
export function init() {
  store.control.on('driveInput-changed', _driveInputRelay);
}

/**
 * De-initialise interactive control listeners
 */
export function deinit() {
  store.control.removeListener('driveInput-changed', _driveInputRelay);
}

// Interactive Relays
/**
 * Relay control inputs from the drive joystick input
 * @param  {Object} event The incomming property change event
 */
function _driveInputRelay(event) {
  const direction = (event.newValue.yMag < 0) ? 'rev' : 'fwd';

  dispatch.tempCmdTrans({
    params: {
      value: event.newValue.yMag,
    },
  });

  // dispatch.driveCmdTrans({
  //   params: {
  //     arc: event.newValue.xMag,
  //     velocity: Math.abs(event.newValue.yMag),
  //     direction,
  //   },
  // });
}
