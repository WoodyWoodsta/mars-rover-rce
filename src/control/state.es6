/* state.es6 */

// Will manage updating the state of the hardware inputs in a timed loop
// TODO: Needs to indicate when it is currently effecting signal curves

import debug from 'debug';
import objectPath from 'object-path';
import penner from 'penner';

import { config } from '../config';
import * as store from '../store';

let interval;

const log = debug('rce:state-driver');
const setpoints = {
  servos: {
    driveFrontLeft: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveFrontRight: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveRearLeft: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    driveRearRight: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerFrontLeft: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerFrontRight: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerRearLeft: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    steerRearRight: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-out',
      _age: 0,
    },
    headPan: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-in-out',
      _age: 0,
    },
    headPitch: {
      value: 0,
      velocity: 1,
      timingFunc: 'ease-in-out',
      _age: 0,
    },
  },
};

export class StateDriver {
  constructor(params, timingFunc) {
    this.servos = params.servos;

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
 * Update the setpoint signals for the loop to interpolate to (asynchronously)
 * @param {StateDriver} driver The object of desired hardware signal setpoints
 */
export function setSignals(driver) {
  Object.keys(driver.servos).forEach((servo) => {
    const _age = (setpoints.servos[servo].value === driver.servos[servo].value) ? setpoints.servos[servo]._age : 0;

    setpoints.servos[servo] = {
      ...driver.servos[servo],
      _age,
    };
  });
}

// === Private ===
function _stateLoop() {
  // Check servo value changes
  Object.keys(setpoints.servos).forEach((servo) => {
    _evalChange(servo, `servos.values.${servo}`);
  });
}

function _evalChange(component, pathToState) {
  const state = objectPath.get(store.hardwareState, pathToState);
  const driver = setpoints.servos[component];

  if (driver.value !== state) {
    driver._age += config.hardware.stateLoopInterval;
    _effectServoChange(component);
  }
}

function _effectServoChange(servo) {
  const state = store.hardwareState.servos.values[servo];
  const driver = setpoints.servos[servo];
  const duration = driver.velocity * config.hardware.stateLoopMaxDuration;
  const time = driver._age;
  const delta = driver.value - state;


  let newState;

  switch (driver.timingFunc) {
    case 'ease-out':
      newState = penner[`easeOut${config.hardware.stateLoopPennerFamily}`](time, state, delta, duration);
      break;
    case 'ease-in-out':
      newState = penner[`easeInOut${config.hardware.stateLoopPennerFamily}`](time, state, delta, duration);
      break;
    case 'linear':
      newState = penner.linear(time, state, delta, duration);
      break;
    default:
  }

  // log(`State: ${state}, Driving Val: ${driver.value}, Delta: ${delta}, Time: ${time}, Duration: ${duration}, New State: ${newState}`);
  store.hardwareState.set(`servos.values.${servo}`, newState);
}

/**
 * Generate a driver object with the age details appended
 * @param  {Object} driver The object containing the driving signal for the hardware component
 * @return {Object}        The appended object
 */
function _populateSetpointObj(driver) {
  return {
    ...driver,
    _age: 0,
  };
}
