/* self-diagnostics.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';

import { execSequence } from '../control/rose';
import * as commands from '../control/commands';
import * as store from '../store';

const log = debug('rce:sequence:self-diagnostics');

/**
 * self diagnostics sequence
 */
export default function seq() {
  store.rceState.set('selfDiagnostics.running', true);
  const diagSequence = [];

  // === Steer ===
  // Test front left steer servo
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fl',
    angle: 45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fl',
    angle: -45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fl',
    angle: 0,
    velocity: 0,
  }));

  // Test front right steer servo
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fr',
    angle: 45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fr',
    angle: -45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'fr',
    angle: 0,
    velocity: 0,
  }));

  // Test rear left steer servo
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rl',
    angle: 45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rl',
    angle: -45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rl',
    angle: 0,
    velocity: 0,
  }));

  // Test rear right steer servo
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rr',
    angle: 45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rr',
    angle: -45,
    velocity: 0,
  }));
  diagSequence.push(new commands.SingleWheelRotateCmd({
    wheel: 'rr',
    angle: 0,
    velocity: 0,
  }));

  diagSequence.push(new commands.PauseCmd({
    duration: 2,
  }));

  // === Drive ===
  // Test front left drive servo
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'fl',
    velocity: 100,
    duration: 2,
    direction: 'fwd',
  }));
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'fl',
    velocity: 100,
    duration: 2,
    direction: 'rev',
  }));

  // Test front right drive servo
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'fr',
    velocity: 100,
    duration: 2,
    direction: 'fwd',
  }));
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'fr',
    velocity: 100,
    duration: 2,
    direction: 'rev',
  }));

  // Test rear left drive servo
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'rl',
    velocity: 100,
    duration: 2,
    direction: 'fwd',
  }));
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'rl',
    velocity: 100,
    duration: 2,
    direction: 'rev',
  }));

  // Test rear right drive servo
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'rr',
    velocity: 100,
    duration: 2,
    direction: 'fwd',
  }));
  diagSequence.push(new commands.SingleWheelDriveCmd({
    wheel: 'rr',
    velocity: 100,
    duration: 2,
    direction: 'rev',
  }));

  diagSequence.push(new commands.PauseCmd({
    duration: 2,
  }));

  // === Head ===
  // Test head pan servo
  diagSequence.push(new commands.HeadPanCmd({
    angle: 85,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPanCmd({
    angle: 0,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPanCmd({
    angle: -85,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPanCmd({
    angle: 0,
    velocity: 0.1,
  }));

  // Test head pitch servo
  diagSequence.push(new commands.HeadPitchCmd({
    angle: 85,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPitchCmd({
    angle: 0,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPitchCmd({
    angle: -85,
    velocity: 0.1,
  }));
  diagSequence.push(new commands.PauseCmd({
    duration: 0.5,
  }));
  diagSequence.push(new commands.HeadPitchCmd({
    angle: 0,
    velocity: 0.1,
  }));

  store.rceState.set('controller.sequence', diagSequence);
  store.rceState.set('controller.sequenceState', 'running');
  execSequence();

  store.rceState.on('controller.sequenceState-changed', _onSequenceStateChanged);
  store.rceState.on('controller.currentSequenceIndex-changed', _onCurrentSequenceIndexChanged);
}

// === Private ===
/**
 * Handle the end of the sequence execution
 * @param  {Object} event Incoming property change evetn
 */
function _onSequenceStateChanged(event) {
  if (event.newValue === 'off') {
    store.rceState.set('selfDiagnostics.running', false);
  }

  store.rceState.removeListener('controller.sequenceState-changed', _onSequenceStateChanged);
  store.rceState.removeListener('controller.currentSequenceIndex-changed', _onCurrentSequenceIndexChanged);
}

/**
 * Output diagnostics state telemetry
 * @param  {Object} event The incoming property change event
 */
function _onCurrentSequenceIndexChanged(event) {
  switch (event.newValue) {
    case 0:
      store.rceState.set('selfDiagnostics.status', 'Testing front left steering servo');
      break;
    case 3:
      store.rceState.set('selfDiagnostics.status', 'Testing front right steering servo');
      break;
    case 6:
      store.rceState.set('selfDiagnostics.status', 'Testing rear left steering servo');
      break;
    case 9:
      store.rceState.set('selfDiagnostics.status', 'Testing rear right steering servo');
      break;
    case 13:
      store.rceState.set('selfDiagnostics.status', 'Testing front left drive servo');
      break;
    case 15:
      store.rceState.set('selfDiagnostics.status', 'Testing front right drive servo');
      break;
    case 17:
      store.rceState.set('selfDiagnostics.status', 'Testing rear left drive servo');
      break;
    case 19:
      store.rceState.set('selfDiagnostics.status', 'Testing rear right drive servo');
      break;

    case 21:
      store.rceState.set('selfDiagnostics.status', 'Testing head pan servo');
      break;
    case 28:
      store.rceState.set('selfDiagnostics.status', 'Testing head pitch servo');
      break;
    default:
  }
}
