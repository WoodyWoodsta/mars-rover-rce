/* servos.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import objectPath from 'object-path';

import { config } from '../config';
import * as store from '../store';
import { servos as servoTrims, init as initTrims } from './trims';

const log = debug('rce:board-servos');

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};

/**
 * Initialise the leds
 */
export function init() {
  hw = {
    /**
     * Front left drive servo
     */
    driveFrontLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      deadband: config.hardware.servoDeadband.driveFrontLeft,
      pin: config.hardware.servoPins.driveFrontLeft,
      ...config.hardware.servoAdditional.driveFrontLeft,
    }),
    /**
     * Front right drive servo
     */
    driveFrontRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      deadband: config.hardware.servoDeadband.driveFrontRight,
      pin: config.hardware.servoPins.driveFrontRight,
      ...config.hardware.servoAdditional.driveFrontRight,
    }),
    /**
     * Rear left drive servo
     */
    driveRearLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      deadband: config.hardware.servoDeadband.driveRearLeft,
      pin: config.hardware.servoPins.driveRearLeft,
      ...config.hardware.servoAdditional.driveRearLeft,
    }),
    /**
     * Rear right drive servo
     */
    driveRearRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      deadband: config.hardware.servoDeadband.driveRearRight,
      pin: config.hardware.servoPins.driveRearRight,
      ...config.hardware.servoAdditional.driveRearRight,
    }),
    /**
     * Front left steering servo
     */
    steerFrontLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerFrontLeft,
      ...config.hardware.servoAdditional.steerFrontLeft,
    }),
    /**
     * Front right steering servo
     */
    steerFrontRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerFrontRight,
      ...config.hardware.servoAdditional.steerFrontRight,
    }),
    /**
     * Rear left steering servo
     */
    steerRearLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerRearLeft,
      ...config.hardware.servoAdditional.steerRearLeft,
    }),
    /**
     * Rear right steering servo
     */
    steerRearRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerRearRight,
      ...config.hardware.servoAdditional.steerRearRight,
    }),
    /**
     * Head pan servo
     */
    headPan: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.headPan,
      ...config.hardware.servoAdditional.headPan,
    }),
    /**
     * Head tilt servo
     */
    headPitch: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.headPitch,
      ...config.hardware.servoAdditional.headPitch,
    }),
  };

  // Initialise the trims module
  initTrims();
  
  // TODO: Do some servo centering and stuff here

  store.hardwareState.set('servos.initialised', true);
  setInterval(_customEmitServos, config.hardware.telemetryInterval);

  log('Servos initialised');
}

/**
 * Set the servo to the input value, with trims and modifiers applied
 * @param {String} servo The name of the servo
 * @param {Number} value The signal value
 */
export function setServo(servo, value) {
  let signal;
  switch (servo) {
    case 'driveFrontLeft': {
      let _value = value;
      _value *= servoTrims.multiplier.driveFrontLeft;
      signal = (_value * 90) + 90; // Continuous
      signal += servoTrims.offset.driveFrontLeft;
      break;
    }
    case 'driveFrontRight': {
      let _value = value;
      _value *= servoTrims.multiplier.driveFrontLeft;
      signal = (_value * 90) + 90; // Continuous
      signal += servoTrims.offset.driveFrontRight;
      break;
    }
    case 'driveRearLeft': {
      let _value = value;
      _value *= servoTrims.multiplier.driveFrontLeft;
      signal = (_value * 90) + 90; // Continuous
      signal += servoTrims.offset.driveRearLeft;
      break;
    }
    case 'driveRearRight': {
      let _value = value;
      _value *= servoTrims.multiplier.driveFrontLeft;
      signal = (_value * 90) + 90; // Continuous
      signal += servoTrims.offset.driveRearRight;
      break;
    }
    case 'steerFrontLeft':
      signal = value + 90;
      signal *= servoTrims.multiplier.steerFrontLeft;
      signal += servoTrims.offset.steerFrontLeft;
      break;
    case 'steerFrontRight':
      signal = value + 90;
      signal *= servoTrims.multiplier.steerFrontRight;
      signal += servoTrims.offset.steerFrontRight;
      break;
    case 'steerRearLeft':
      signal = value + 90;
      signal *= servoTrims.multiplier.steerRearLeft;
      signal += servoTrims.offset.steerRearLeft;
      break;
    case 'steerRearRight':
      signal = value + 90;
      signal *= servoTrims.multiplier.steerRearRight;
      signal += servoTrims.offset.steerRearRight;
      break;
    case 'headPan':
      signal = value + 90;
      signal *= servoTrims.multiplier.headPan;
      signal += servoTrims.offset.headPan;
      break;
    case 'headPitch':
      signal = value + 90;
      signal *= servoTrims.multiplier.headPitch;
      signal += servoTrims.offset.headPitch;
      break;
    default:

  }

  hw[servo].to(signal);
}

// === Private ===
/**
 * Send servo telemtry synchronously
 */
function _customEmitServos() {
  Object.keys(hw).forEach((servo) => {
    if (objectPath.get(_customEmitServos, servo) !== store.hardwareState.servos.values[servo]) {
      store.hardwareState.repush(`servos.values.${servo}`);
      _customEmitServos[servo] = store.hardwareState.servos.values[servo];
    }
  });
}
