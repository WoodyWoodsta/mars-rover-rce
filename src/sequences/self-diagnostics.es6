/* self-diagnostics.es6 */
import debug from 'debug';

import { execSequence } from '../control/rose';
import * as commands from '../control/commands';
import * as store from '../store';

const log = debug('rce:sequence:self-diagnostics');

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
    angle: 90,
    velocity: 0,
  }));
  diagSequence.push(new commands.HeadPanCmd({
    angle: -90,
    velocity: 0,
  }));
  diagSequence.push(new commands.HeadPanCmd({
    angle: 0,
    velocity: 0,
  }));

  // Test head pitch servo
  diagSequence.push(new commands.HeadPitchCmd({
    angle: 90,
    velocity: 0,
  }));
  diagSequence.push(new commands.HeadPitchCmd({
    angle: -90,
    velocity: 0,
  }));
  diagSequence.push(new commands.HeadPitchCmd({
    angle: 0,
    velocity: 0,
  }));

  store.rceState.set('controller.sequence', diagSequence);
  store.rceState.set('controller.sequenceState', 'running');
  execSequence();

  store.rceState.on('controller.sequenceState-changed', _onSequenceStateChanged);
}

// === Private ===
function _onSequenceStateChanged(event) {
  if (event.newValue === 'off') {
    store.rceState.set('selfDiagnostics.running', false);
  }

  store.rceState.removeListener('controller.sequenceState-changed', _onSequenceStateChanged);
}
