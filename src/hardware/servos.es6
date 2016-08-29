/* servos.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
import { config } from '../../config';

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
    drive: {
      /**
       * Front left drive servo
       */
      fl: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        type: 'continuous',
        deadband: config.hardware.servoDeadband.driveFrontLeft,
        pin: config.hardware.servoPins.driveFrontLeft,
      }),
      /**
       * Front right drive servo
       */
      fr: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        type: 'continuous',
        deadband: config.hardware.servoDeadband.driveFrontRight,
        pin: config.hardware.servoPins.driveFrontRight,
      }),
      /**
       * Rear left drive servo
       */
      rl: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        type: 'continuous',
        deadband: config.hardware.servoDeadband.driveRearLeft,
        pin: config.hardware.servoPins.driveRearLeft,
      }),
      /**
       * Rear right drive servo
       */
      rr: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        type: 'continuous',
        deadband: config.hardware.servoDeadband.driveRearRight,
        pin: config.hardware.servoPins.driveRearRight,
      }),
    },
    steer: {
      /**
       * Front left steering servo
       */
      fl: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.steerFrontLeft,
      }),
      /**
       * Front right steering servo
       */
      fr: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.steerFrontRight,
      }),
      /**
       * Rear left steering servo
       */
      rl: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.steerRearLeft,
      }),
      /**
       * Rear right steering servo
       */
      rr: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.steerRearRight,
      }),
    },
    head: {
      /**
       * Head pan servo
       */
      pan: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.headPan,
      }),
      /**
       * Head tilt servo
       */
      tilt: new five.Servo({
        address: config.hardware.servoShield.i2cAddress,
        controller: 'PCA9685',
        pin: config.hardware.servoPins.headTilt,
      }),
    },
  };

  log('Servos initialised');
}
