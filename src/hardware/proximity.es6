/* leds.es6 */
import debug from 'debug';
import * as five from 'johnny-five';

import { config } from '../config';
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
  store.hardwareState.set('proximity.initialised', true);
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

  this.hardwareState.set('proximity.warn.front', checkObstacle('frontSensor', mm));
}

function _onRearSensorData() {
  const mm = this.cm * 10;
  store.hardwareState.set('proximity.values.rear', mm);

  this.hardwareState.set('proximity.warn.rear', checkObstacle('rearSensor', mm));
}

function _onHeadSensorData() {
  const mm = this.cm * 10;
  store.hardwareState.set('proximity.values.head', mm);

  this.hardwareState.set('proximity.warn.head', checkObstacle('headSensor', mm));
}

function checkObstacle(sensor, dist) {
  if (dist < config.proximityThreshholds.warn[sensor]) {
    return 'warn';
  }

  if (dist < config.proximityThreshholds.shutdown[sensor]) {
    return 'shutdown';
  }
}
