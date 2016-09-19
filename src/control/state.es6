/* state.es6 */

// Will manage updating the state of the hardware inputs in a timed loop
// TODO: Needs to indicate when it is currently effecting signal curves

import debug from 'debug';
import objectPath from 'object-path';
import penner from 'penner';

import { config } from '../config';
import * as store from '../store';
import * as servos from '../hardware/servos';

let interval;

const log = debug('rce:state-driver');
const setpoints = {
  servos: {
    driveFrontLeft: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveFrontRight: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveRearLeft: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveRearRight: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerFrontLeft: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerFrontRight: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerRearLeft: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerRearRight: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    headPan: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-in-out',
      _age: 0,
    },
    headPitch: {
      value: 0,
      start: 0,
      velocity: 1,
      timingFunc: 'ease-in-out',
      _age: 0,
    },
  },
};

/**
 * A set of control values to impress upon the hardware
 * @param {Object}  params      An object of control outputs
 * @param {String}  timingFunc  A timing function to apply to all control outputs that do not have one specified
 */
export class StateDriver {
  constructor(params, timingFunc) {
    this.servos = params.servos;
    this.duration = params.duration || Infinity;
    this.cmdDuration = params.cmdDuration || params.duration || Infinity;

    Object.keys(this.servos).forEach((servo) => {
      // Set collective or default timing function
      if (!this.servos[servo].timingFunc) {
        this.servos[servo].timingFunc = timingFunc || 'ease-out';
      }

      // Set default velocity
      if (!this.servos[servo].velocity) {
        this.servos[servo].velocity = 1;
      }
    });
  }
}

/**
 * Start the driving loop
 */
export function start() {
  interval = setInterval(_stateLoop, config.hardware.stateLoopInterval);
  store.rceState.set('controller.stateLoopRunning', true);
}

/**
 * Stop the driving loop
 */
export function stop() {
  if (!store.rceState.controller.stateLoopRunning) {
    clearInterval(interval);
    store.rceState.set('controller.stateLoopRunning', false);
  }
}

/**
 * Update the setpoint signals for the loop to interpolate to (asynchronously). If there is a change between the driving signal
 * and the setpoint, reset the age of the state change motion
 * @param {StateDriver} driver The object of desired hardware signal setpoints
 */
export function setSignals(driver) {
  Object.keys(driver.servos).forEach((servo) => {
    if (setpoints.servos[servo].value !== driver.servos[servo].value) {
      setpoints.servos[servo] = {
        ...driver.servos[servo],
        _age: 0,
        start: store.hardwareState.servos.values[servo],
      };
    }
  });
}

// === Private ===
/**
 * The loop which will be executed at the specified interval
 */
function _stateLoop() {
  // Check servo value changes
  Object.keys(setpoints.servos).forEach((servo) => {
    _evalChange(servo, `servos.values.${servo}`);
  });
}

/**
 * Evaluate the change between the driving signal and the current signal state.
 * If there is a difference, the change will be effected.
 * @param  {String} component   The name of the component in the setpoints object
 * @param  {String} pathToState Path in the store to the current state of that component
 */
function _evalChange(component, pathToState) {
  const state = objectPath.get(store.hardwareState, pathToState);
  const driver = setpoints.servos[component];

  if (driver.value !== state) {
    driver._age += config.hardware.stateLoopInterval;
    _effectServoChange(component);
  }
}

/**
 * Calculate the next value of the hardware outputs given the setpoints and the transient point in the motion curve
 * @param  {String} servo The name of the servo upon which to effect a change
 */
function _effectServoChange(servo) {
  const driver = setpoints.servos[servo];
  const duration = driver.velocity * config.hardware.stateLoopMaxDuration;
  const time = driver._age;
  const delta = driver.value - driver.start;

  let newState;

  // Use the specified timging function
  switch (driver.timingFunc) {
    case 'ease-out':
      newState = penner[`easeOut${config.hardware.stateLoopPennerFamily}`](time, driver.start, delta, duration);
      break;
    case 'ease-in-out':
      newState = penner[`easeInOut${config.hardware.stateLoopPennerFamily}`](time, driver.start, delta, duration);
      break;
    case 'linear':
      newState = penner.linear(time, driver.start, delta, duration);
      break;
    default:
  }

  // TODO: Consider setting the servos directly and updating the store at a later stage
  store.hardwareState.servos.values[servo] = newState;
  servos.setServo(servo, newState);
}
