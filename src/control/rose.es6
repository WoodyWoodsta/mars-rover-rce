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

export function execSequence() {
  // Clear the sequence in lieu of new one
  currentSequence = [];
  _decodeCommands();

  log('Executing sequence');
  _popExecCommand(0);
}

// === Private ===
function _seqStateRelay(event) {
  if (event.newValue === 'running') {
    execSequence();
  }
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
        log(cmd.params.direction.value);

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
          waitForComplete: true,
        });
        cmd4._index = index;

        const cmd5 = new commands.PauseCmd({
          duration: 1,
        });
        cmd5._index = index;

        const cmd6 = new commands.SingleWheelDriveCmd({
          duration: Infinity,
          velocity: cmd.params.velocity.value,
          wheel: 'fl',
          direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
        });
        cmd6._index = index;
        const cmd7 = new commands.SingleWheelDriveCmd({
          duration: Infinity,
          velocity: cmd.params.velocity.value,
          wheel: 'fr',
          direction: (cmd.params.direction.value === 'ccw') ? 'fwd' : 'rev',
        });
        cmd7._index = index;
        const cmd8 = new commands.SingleWheelDriveCmd({
          duration: Infinity,
          velocity: cmd.params.velocity.value,
          wheel: 'rl',
          direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
        });
        cmd8._index = index;
        const cmd9 = new commands.SingleWheelDriveCmd({
          duration: Infinity,
          velocity: cmd.params.velocity.value,
          wheel: 'rr',
          direction: (cmd.params.direction.value === 'ccw') ? 'fwd' : 'rev',
        });
        cmd9._index = index;

        currentSequence.push(cmd1);
        currentSequence.push(cmd2);
        currentSequence.push(cmd3);
        currentSequence.push(cmd4);
        currentSequence.push(cmd5);
        currentSequence.push(cmd6);
        currentSequence.push(cmd7);
        currentSequence.push(cmd8);
        currentSequence.push(cmd9);

        // Only stop the motion if there was an explicit duration
        if (cmd.params.duration.value !== Infinity) {
          const cmd10 = new commands.PauseCmd({
            duration: cmd.params.duration.value,
          });
          cmd10._index = index;

          const cmd11 = new commands.SingleWheelDriveCmd({
            duration: Infinity,
            velocity: 0,
            wheel: 'fl',
            direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
          });
          cmd11._index = index;
          const cmd12 = new commands.SingleWheelDriveCmd({
            duration: Infinity,
            velocity: 0,
            wheel: 'fr',
            direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
          });
          cmd12._index = index;
          const cmd13 = new commands.SingleWheelDriveCmd({
            duration: Infinity,
            velocity: 0,
            wheel: 'rl',
            direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
          });
          cmd13._index = index;
          const cmd14 = new commands.SingleWheelDriveCmd({
            duration: Infinity,
            velocity: 0,
            wheel: 'rr',
            direction: (cmd.params.direction.value === 'cw') ? 'fwd' : 'rev',
          });
          cmd14._index = index;

          const cmd15 = new commands.SingleWheelRotateCmd({
            wheel: 'fl',
            angle: 0,
            velocity: 0,
            waitForComplete: false,
          });
          cmd15._index = index;
          const cmd16 = new commands.SingleWheelRotateCmd({
            wheel: 'fr',
            angle: 0,
            velocity: 0,
            waitForComplete: false,
          });
          cmd16._index = index;
          const cmd17 = new commands.SingleWheelRotateCmd({
            wheel: 'rl',
            angle: 0,
            velocity: 0,
            waitForComplete: false,
          });
          cmd17._index = index;
          const cmd18 = new commands.SingleWheelRotateCmd({
            wheel: 'rr',
            angle: 0,
            velocity: 0,
            waitForComplete: true,
          });
          cmd18._index = index;

          currentSequence.push(cmd10);
          currentSequence.push(cmd11);
          currentSequence.push(cmd12);
          currentSequence.push(cmd13);
          currentSequence.push(cmd14);
          currentSequence.push(cmd15);
          currentSequence.push(cmd16);
          currentSequence.push(cmd17);
          currentSequence.push(cmd18);
        }
        break;
      }
      case 'HeadPositionCmd': {
        const cmd1 = new commands.HeadPanCmd({
          angle: cmd.params.panAngle.value,
          velocity: cmd.params.velocity.value,
          waitForComplete: false,
        });
        cmd1._index = index;

        const cmd2 = new commands.HeadPitchCmd({
          angle: cmd.params.pitchAngle.value,
          velocity: cmd.params.velocity.value,
          waitForComplete: cmd.params.waitForComplete.value,
        });
        cmd._index = index;

        currentSequence.push(cmd1);
        currentSequence.push(cmd2);
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
      case 'HeadPanCmd':
        dispatch.headPanCmdTrans(cmd);
        break;
      case 'HeadPitchCmd':
        dispatch.headPitchCmdTrans(cmd);
        break;
      default:
        log(`No such command found of type: ${cmd._name}`);

        // Exit
        store.rceState.set('controller.sequenceState', 'off');
        store.rceState.set('controller.currentSequenceIndex', null);

        // TODO: Send back a command failure message?

    }
  } else {
    store.rceState.set('controller.sequenceState', 'off');
    store.rceState.set('controller.currentSequenceIndex', null);
  }
}
