/* servos.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import objectPath from 'object-path';

import { config } from '../config';
import * as store from '../store';

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
      type: 'continuous',
      deadband: config.hardware.servoDeadband.driveFrontLeft,
      pin: config.hardware.servoPins.driveFrontLeft,
    }),
    /**
     * Front right drive servo
     */
    driveFrontRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      type: 'continuous',
      deadband: config.hardware.servoDeadband.driveFrontRight,
      pin: config.hardware.servoPins.driveFrontRight,
    }),
    /**
     * Rear left drive servo
     */
    driveRearLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      type: 'continuous',
      deadband: config.hardware.servoDeadband.driveRearLeft,
      pin: config.hardware.servoPins.driveRearLeft,
    }),
    /**
     * Rear right drive servo
     */
    driveRearRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      type: 'continuous',
      deadband: config.hardware.servoDeadband.driveRearRight,
      pin: config.hardware.servoPins.driveRearRight,
    }),
    /**
     * Front left steering servo
     */
    steerFrontLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerFrontLeft,
    }),
    /**
     * Front right steering servo
     */
    steerFrontRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerFrontRight,
    }),
    /**
     * Rear left steering servo
     */
    steerRearLeft: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerRearLeft,
    }),
    /**
     * Rear right steering servo
     */
    steerRearRight: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.steerRearRight,
    }),
    /**
     * Head pan servo
     */
    headPan: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.headPan,
    }),
    /**
     * Head tilt servo
     */
    headPitch: new five.Servo({
      address: config.hardware.servoShield.i2cAddress,
      controller: config.hardware.servoShield.controller,
      pin: config.hardware.servoPins.headPitch,
    }),
  };

  // TODO: Do some servo centering and stuff here

  store.hardwareState.set('servos.initialised', true);
  setInterval(_customEmitServos, config.hardware.telemetryInterval);

  log('Servos initialised');
}

export function setServo(servo, value) {
  let signal;
  switch (servo) {
    // TODO: Update the driving ones before making the servo continuous
    case 'driveFrontLeft':
      signal = (value * 70) + 90;
      break;
    case 'driveFrontRight':
      signal = (value * 70) + 90;
      break;
    case 'driveRearLeft':
      signal = (value * 70) + 90;
      break;
    case 'driveRearRight':
      signal = (value * 70) + 90;
      break;
    case 'steerFrontLeft':
      signal = value + 90;
      break;
    case 'steerFrontRight':
      signal = value + 90;
      break;
    case 'steerRearLeft':
      signal = value + 90;
      break;
    case 'steerRearRight':
      signal = value + 90;
      break;
    case 'headPan':
      signal = value + 90;
      break;
    case 'headPitch':
      signal = value + 90;
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
