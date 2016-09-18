/* servos.es6 */
import debug from 'debug';

import * as five from 'johnny-five';
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

  _registerListeners();

  store.hardwareState.set('servos.initialised', true);
  log('Servos initialised');
}

// === Private ===
function _registerListeners() {
  store.hardwareState.on('servos.values.driveFrontLeft-changed', _onDriveFrontLeftValueChanged);
  store.hardwareState.on('servos.values.driveFrontRight-changed', _onDriveFrontRightValueChanged);
  store.hardwareState.on('servos.values.driveRearLeft-changed', _onDriveRearLeftValueChanged);
  store.hardwareState.on('servos.values.driveRearRight-changed', _onDriveRearRightValueChanged);
  store.hardwareState.on('servos.values.steerFrontLeft-changed', _onSteerFrontLeftValueChanged);
  store.hardwareState.on('servos.values.steerFrontRight-changed', _onSteerFrontRightValueChanged);
  store.hardwareState.on('servos.values.steerRearLeft-changed', _onSteerRearLeftValueChanged);
  store.hardwareState.on('servos.values.steerRearRight-changed', _onSteerRearRightValueChanged);
  store.hardwareState.on('servos.values.headPan-changed', _onHeadPanValueChanged);
  store.hardwareState.on('servos.values.headPitch-changed', _onHeadPitchValueChanged);
}

function _onDriveFrontLeftValueChanged(event) {
  hw.driveFrontLeft.to((event.newValue * 70) + 90);
}

function _onDriveFrontRightValueChanged(event) {
  hw.driveFrontRight.to(event.newValue);
}

function _onDriveRearLeftValueChanged(event) {
  hw.driveRearLeft.to(event.newValue);
}

function _onDriveRearRightValueChanged(event) {
  hw.driveRearRight.to(event.newValue);
}

function _onSteerFrontLeftValueChanged(event) {
  hw.steerFrontLeft.to(event.newValue);
}

function _onSteerFrontRightValueChanged(event) {
  hw.steerFrontRight.to(event.newValue);
}

function _onSteerRearLeftValueChanged(event) {
  hw.steerRearLeft.to(event.newValue);
}

function _onSteerRearRightValueChanged(event) {
  hw.steerRearRight.to(event.newValue);
}

function _onHeadPanValueChanged(event) {
  hw.headPan.to(event.newValue);
}

function _onHeadPitchValueChanged(event) {
  hw.headPitch.to(event.newValue);
}
