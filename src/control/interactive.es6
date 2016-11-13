/* interactive.es6 */
/**
 * Control process startpoint for incomming 'interactive' control from the client
 */
import * as store from '../store';
import * as dispatch from './dispatch';
import * as commands from './commands';
import { execSequence } from './rose';

const rotateCCWCommand = new commands.RoverRotateCmd({
  duration: Infinity,
  velocity: 50,
  direction: 'ccw',
});

const rotateCWCommand = new commands.RoverRotateCmd({
  duration: Infinity,
  velocity: 50,
  direction: 'cw',
});

let runningCCWCommand = false;
let runningCWCommand = false;

/**
 * Initialise interactive control listeners
 */
export function init() {
  if (!init._initialised) {
    store.control.on('driveInput-changed', _driveInputRelay);
    store.control.on('headInput-changed', _headInputRelay);
    store.control.on('buttons.rotateCCW-changed', _rotateCCWInputRelay);
    store.control.on('buttons.rotateCW-changed', _rotateCWInputRelay);

    init._initialised = true;
  }
}

/**
 * De-initialise interactive control listeners
 */
export function deinit() {
  store.control.removeListener('driveInput-changed', _driveInputRelay);
  store.control.removeListener('headInput-changed', _headInputRelay);
  store.control.removeListener('buttons.rotateCCW-changed', _rotateCCWInputRelay);
  store.control.removeListener('buttons.rotateCW-changed', _rotateCWInputRelay);

  init._initialised = false;
}

// Interactive Relays
/**
 * Relay control inputs from the drive joystick input
 * @param  {Object} event The incomming property change event
 */
function _driveInputRelay(event) {
  const direction = (event.newValue.yMag < 0) ? 'fwd' : 'rev';

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

function _rotateCCWInputRelay(event) {
  if (event.newValue && store.rceState.controller.sequenceState === 'off') {
    runningCCWCommand = true;
    store.rceState.set('controller.sequence', [rotateCCWCommand]);
    store.rceState.set('controller.sequenceState', 'running');
    execSequence();
  } else if (runningCCWCommand) {
    if (store.rceState.controller.sequenceState === 'off') {
      _stopRover();
    } else {
      store.rceState.on('controller.sequenceState-changed', _stopRoverCallback);
    }

    runningCCWCommand = false;
  }
}

function _rotateCWInputRelay(event) {
  if (event.newValue && store.rceState.controller.sequenceState === 'off') {
    runningCWCommand = true;
    store.rceState.set('controller.sequence', [rotateCWCommand]);
    store.rceState.set('controller.sequenceState', 'running');
    execSequence();
  } else if (!event.newValue && runningCWCommand) {
    if (store.rceState.controller.sequenceState === 'off') {
      console.log('Rover stopped by depress');
      _stopRover();
    } else {
      store.rceState.on('controller.sequenceState-changed', _stopRoverCallback);
    }

    runningCWCommand = false;
  }
}

function _stopRoverCallback(event) {
  if (event.newValue === 'off') {
    console.log('Rover stopped by callback');
    if ((store.control.buttons.rotateCW === false) || (store.control.buttons.rotateCCW === false)) {
      _stopRover();
    }

    store.rceState.removeListener('controller.sequenceState-changed', _stopRoverCallback);
  }
}

function _stopRover() {
  console.log('Stopping rover');
  _driveInputRelay({
    newValue: {
      xMag: 0,
      yMag: 0,
    },
  });
}
