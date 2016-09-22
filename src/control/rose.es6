/* rose.es6 */
/**
 * Control process startpoint for incomming 'rose' control from the client
 */

import debug from 'debug';

import * as store from '../store';
import * as dispatch from './dispatch';
import * as commands from './commands';

let currentSequence = [];
const log = debug('rce:rose');

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
    _execSequence();
  }
}

function _execSequence() {
  // Clear the sequence in lieu of new one
  currentSequence = [];
  _decodeCommands();

  log('Executing sequence');
  _popExecCommand(0);
}

/**
 * Break the commands down into their respective low or high level equivalents
 * @return {Array}  The new array of decoded commands
 */
function _decodeCommands() {
  store.rceState.controller.sequence.forEach((cmd, index) => {
    Object.keys(cmd.params).forEach((paramKey) => {
      if (cmd.params[paramKey].type === 'Number') {
        cmd.params[paramKey].value = parseFloat(cmd.params[paramKey].value);
      }
    });

    // Catch all the commands that need to be decoded
    switch (cmd._name) {
      case 'RoverRotateCmd': {
        // Decode the Rotate Rover command
        const cmd1 = new commands.SingleWheelRotateCmd({
          wheel: 'fl',
          angle: 45,
          velocity: 0,
          waitForComplete: false,
        });
        cmd1._index = index;
        const cmd2 = new commands.SingleWheelRotateCmd({
          wheel: 'fr',
          angle: -45,
          velocity: 0,
          waitForComplete: false,
        });
        cmd2._index = index;
        const cmd3 = new commands.SingleWheelRotateCmd({
          wheel: 'rl',
          angle: -45,
          velocity: 0,
          waitForComplete: false,
        });
        cmd3._index = index;
        const cmd4 = new commands.SingleWheelRotateCmd({
          wheel: 'rr',
          angle: 45,
          velocity: 0,
          waitForComplete: false,
        });
        cmd4._index = index;

        const cmd5 = new commands.PauseCmd({
          duration: 1000,
        });
        cmd5._index = index;

        const cmd6 = new commands.SingleWheelDriveCmd({
          duration: cmd.params.duration.value * 1000,
          velocity: cmd.params.velocity.value,
          wheel: 'fl',
          direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
        });

        currentSequence.push(cmd1);
        currentSequence.push(cmd2);
        currentSequence.push(cmd3);
        currentSequence.push(cmd4);
        currentSequence.push(cmd5);
        break;
      }
      default:
        cmd._seqIndex = index;
        currentSequence.push(cmd);
        break;
    }
  });
}

function _popExecCommand(index) {
  if (index < currentSequence.length) {
    let _index = index;
    const cmd = currentSequence[_index];
    cmd.callback = () => {
      _popExecCommand(_index += 1);
    };

    store.rceState.set('controller.currentSequenceIndex', cmd._seqIndex);

    switch (cmd._name) {
      case 'PauseCmd':
        dispatch.pauseCmdTrans(cmd);
        break;
      case 'SingleWheelRotateCmd':
        dispatch.singleWheelRotateCmdTrans(cmd);
        break;
      case 'SingleWheelDriveCmd':
        dispatch.singleWheelDriveCmdTrans(cmd);
        break;
      case 'DriveCmd':
        dispatch.driveCmdTrans(cmd);
        break;
      case 'WheelsRotateCmd':
        dispatch.wheelsRotateCmdTrans(cmd);
        break;
      default:
        log(`No such command found of type: ${cmd._name}`);
    }
  } else {
    store.rceState.set('controller.sequenceState', 'off');
    store.rceState.set('controller.currentSequenceIndex', null);
  }
}
