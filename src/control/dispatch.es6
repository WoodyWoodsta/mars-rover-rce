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

import * as config from '../config';
import * as state from './state';

// === Translators ===

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
  _dispatch(new state.StateDriver(servos, 'cubic'));
}

// === Private ===
/**
* Send the hardware signals to the output loop
* @param  {StateDriver} driver The object of hardware signals
*/
function _dispatch(driver) {
  // TODO: Check for control type
}

/**
 * Compute the angle at which to turn the wheels for a sepcified fact of arc
 * @param  {Number} arcFactor The factor by which the rover should arc/turn
 */
function _computeArcRotation(arcFactor) {
  const servos = {};
  const arcs = _computeArc(arcFactor);

  servos[`turnFront${arcs.smallSide}`].value = arcs.smallAngle;
  servos[`turnFront${arcs.largeSide}`].value = arcs.largeAngle;
  servos[`turnRear${arcs.smallSide}`].value = -1 * arcs.smallAngle;
  servos[`turnRear${arcs.largeSide}`].value = -1 * arcs.largeAngle;

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
  const servos = {};
  const arcs = _computeArc(arcFactor);
  const diffFactor = arcs.smallRadius / arcs.largeRadius;

  servos[`turnFront${arcs.smallSide}`].value = velocity * diffFactor * ((direction === 'fwd') ? 1 : -1);
  servos[`turnFront${arcs.largeSide}`].value = velocity * ((direction === 'fwd') ? 1 : -1);
  servos[`turnRear${arcs.smallSide}`].value = velocity * diffFactor * ((direction === 'fwd') ? 1 : -1);
  servos[`turnRear${arcs.largeSide}`].value = velocity * ((direction === 'fwd') ? 1 : -1);

  return servos;
}

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
