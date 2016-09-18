/* dispatch.es6 */
/**
 * Handles incomming commands and dispatches them to the state loop
 * Contains command translators and the executor
 *
 * Hardware Input Schema

{
  servos: {
    <servoName>: {
      value: Number,
      velocity: Number,

    },
  },
}

 */

import objectPath from 'object-path';

import { config } from '../config';
import * as state from './state';
import * as store from '../store';

// === Translators ===

/**
 * Test command translator for low bandwith functional testing
 * @param  {Object} cmd The command to be translated
 */
export function tempCmdTrans(cmd) {
  const servos = {
    driveFrontLeft: {
      value: cmd.params.value,
    },
  };

  _dispatch(new state.StateDriver({ servos }, 'ease-out'));
}

/**
 * Translates the DriveCmd into outputs for dispatch
 * @param  {DriveCmd} cmd The DriveCmd to be translated
 */
export function driveCmdTrans(cmd) {
  const servos = {
    ..._computeArcRotation(cmd.params.arc),
    ..._computeWheelVelocities(cmd.params.arc, cmd.params.velocity, cmd.params.direction),
  };

  // Dispatch with a default cubic curve
  _dispatch(new state.StateDriver({ servos }, 'ease-out'));
}

// === Private ===
/**
* Send the hardware signals to the output loop, manage execution time, if required
* @param  {StateDriver} driver The object of hardware signals
*/
function _dispatch(driver) {
  // If a duration is supplied, send to the executor
  if (driver.duration !== Infinity) {
    _execute(driver);
    return;
  }

  // Send the drivering signals to the loop
  state.setSignals(driver);
}

/**
 * Drive hardware signals for a specified length of time
 * @param  {StateDriver} driver The object of hardware signals
 * @param  {StateDriver} driver The object of hardware signals
 */
function _execute(driver) {
  const origValues = {};

  Object.keys(driver.servos).forEach((servo) => {
    objectPath.set(origValues, `servos.${servo}.value`, store.hardwareState.servos.values[servo]);
    objectPath.set(origValues, `servos.${servo}.timingFunc`, driver.servos[servo].timingFunc);
    objectPath.set(origValues, `servos.${servo}.velocity`, driver.servos[servo].velocity);
  });

  state.setSignals(driver);
  setTimeout(() => {
    state.setSignals(new state.StateDriver(origValues));
  }, driver.duration);
}

/**
 * Compute the angle at which to turn the wheels for a sepcified fact of arc
 * @param  {Number} arcFactor The factor by which the rover should arc/turn
 */
function _computeArcRotation(arcFactor) {
  const servos = {
    steerFrontLeft: { value: 0 },
    steerFrontRight: { value: 0 },
    steerRearLeft: { value: 0 },
    steerRearRight: { value: 0 },
  };

  const arcs = _computeArc(arcFactor);

  servos[`steerFront${arcs.smallSide}`].value = arcs.smallAngle;
  servos[`steerFront${arcs.largeSide}`].value = arcs.largeAngle;
  servos[`steerRear${arcs.smallSide}`].value = -1 * arcs.smallAngle;
  servos[`steerRear${arcs.largeSide}`].value = -1 * arcs.largeAngle;

  return servos;
}

/**
 * Compute the speed of the wheels given the amount at which it is turning
 * The Assumption here is that the speed of the servos will vary linearly based on the driving unit
 * @param  {Number} arcFactor The factor by which it should arc/turning
 * @param  {Number} velocity  The factor of velocity [0, 1]
 * @param  {String} direction The direction of the driving ['fwd'|'rev']
 */
function _computeWheelVelocities(arcFactor, velocity, direction) {
  const servos = {
    driveFrontLeft: { value: 0 },
    driveFrontRight: { value: 0 },
    driveRearLeft: { value: 0 },
    driveRearRight: { value: 0 },
  };

  const arcs = _computeArc(arcFactor);
  const diffFactor = arcs.smallRadius / arcs.largeRadius;

  servos[`driveFront${arcs.smallSide}`].value = velocity * diffFactor * ((direction === 'fwd') ? 1 : -1);
  servos[`driveFront${arcs.largeSide}`].value = velocity * ((direction === 'fwd') ? 1 : -1);
  servos[`driveRear${arcs.smallSide}`].value = velocity * diffFactor * ((direction === 'fwd') ? 1 : -1);
  servos[`driveRear${arcs.largeSide}`].value = velocity * ((direction === 'fwd') ? 1 : -1);

  return servos;
}

/**
 * Compute the arc dimensions of the wheels for a given arc factor
 * @param  {Number} arcFactor The factor by which the rover should turn/arc
 * @return {Object}           An object of the calculated dimensions
 */
function _computeArc(arcFactor) {
  const largeSide = (arcFactor < 0) ? 'Right' : 'Left';
  const smallSide = (largeSide === 'Right') ? 'Left' : 'Right';
  const smallAngle = arcFactor * 45;
  const smallRadius = config.hardware.wheelPitch / Math.tan(Math.abs(smallAngle));
  const largeRadius = config.hardware.wheelSpan + smallRadius;
  const largeAngle = Math.atan(config.hardware.wheelPitch / largeRadius);

  return {
    largeSide,
    smallSide,
    smallAngle,
    smallRadius,
    largeRadius,
    largeAngle,
  };
}
