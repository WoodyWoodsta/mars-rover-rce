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
  store.control.on('headInput-changed', _headInputRelay);
}

/**
 * De-initialise interactive control listeners
 */
export function deinit() {
  store.control.removeListener('driveInput-changed', _driveInputRelay);
  store.control.removeListener('headInput-changed', _headInputRelay);
}

// Interactive Relays
/**
 * Relay control inputs from the drive joystick input
 * @param  {Object} event The incomming property change event
 */
function _driveInputRelay(event) {
  const direction = (event.newValue.yMag < 0) ? 'rev' : 'fwd';

  dispatch.driveCmdTrans({
    params: {
      arc: {
        value: event.newValue.xMag,
      },
      velocity: {
        value: Math.abs(event.newValue.yMag) * 100,
      },
      direction: {
        value: direction,
      },
    },
  });
}

/**
 * Relay control inputs from the head joystick input
 * @param  {Object} event The incomming property change event
 */
function _headInputRelay(event) {
  dispatch.headPanCmdTrans({
    params: {
      angle: {
        value: event.newValue.xMag * 90,
      },
      velocity: {
        value: 0,
      },
    },
  });

  dispatch.headPitchCmdTrans({
    params: {
      angle: {
        value: event.newValue.yMag * 90,
      },
      velocity: {
        value: 0,
      },
    },
  });
}
