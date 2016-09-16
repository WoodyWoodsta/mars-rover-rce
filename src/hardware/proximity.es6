/* leds.es6 */
import debug from 'debug';
import * as five from 'johnny-five';

import * as config from '../config'
import * as store from '../store';

const log = debug('rce:proximity');

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
    frontSensor: new five.Proximity({
      controller: config.hardware.proximityController,
      pin: config.hardware.proximityPins.frontSensor,
      freq: config.hardware.proximityFreq,
    }),
    rearSensor: new five.Proximity({
      controller: config.hardware.proximityController,
      pin: config.hardware.proximityPins.rearSensor,
      freq: config.hardware.proximityFreq,
    }),
    headSensor: new five.Proximity({
      controller: config.hardware.proximityController,
      pin: config.hardware.proximityPins.headSensor,
      freq: config.hardware.proximityFreq,
    }),
  };

  log('Proximity initialised');
  store.hardwareState.set('leds.initialised', true);
}

export function start() {
  hw.frontSensor.on('data', _onFrontSensorData);
  hw.rearSensor.on('data', _onRearSensorData);
  hw.headSensor.on('data', _onHeadSensorData);
}

export function stop() {
  hw.frontSensor.removeListener('data', _onFrontSensorData);
  hw.rearSensor.removeListener('data', _onRearSensorData);
  hw.headSensor.removeListener('data', _onHeadSensorData);
}

// === Private ===
function _onFrontSensorData() {
  const mm = this.cm * 10;
  store.hardwareState.set('proximity.values.front', mm);

  const check = checkObstacle('frontSensor', mm);

  if (check === 'warn') {
    this.hardwareState.set('proximity.warn.front', true);
  } else if (check === 'shutdown') {
    this.hardwareState.set('proximity.shutdown.front', true);
  }
}

function _onRearSensorData() {
  const mm = this.cm * 10;
  store.hardwareState.set('proximity.values.rear', mm);

  const check = checkObstacle('rearSensor', mm);

  if (check === 'warn') {
    this.hardwareState.set('proximity.warn.rear', true);
  } else if (check === 'shutdown') {
    this.hardwareState.set('proximity.shutdown.rear', true);
  }
}

function _onHeadSensorData() {
  const mm = this.cm * 10;
  store.hardwareState.set('proximity.values.head', mm);

  const check = checkObstacle('headSensor', mm);

  if (check === 'warn') {
    this.hardwareState.set('proximity.warn.head', true);
  } else if (check === 'shutdown') {
    this.hardwareState.set('proximity.shutdown.head', true);
  }
}

function checkObstacle(sensor, dist) {
  if (dist < config.proximityThreshholds.warn[sensor]) {
    return 'warn';
  }

  if (dist < config.proximityThreshholds.shutdown[sensor]) {
    return 'shutdown';
  }
}
