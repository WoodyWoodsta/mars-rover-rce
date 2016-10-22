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
  let time = 0;

  _onFrontSensorData.count = 0;

  // Setup sensors
  hw = {
    front: new UltrasonicSensor({
      triggerPin: config.hardware.proximityTriggerPins.front,
      voltagePin: config.hardware.proximityVoltagePins.front,
    }, _onFrontSensorData),
  };

  log('Proximity initialised');
  store.hardwareState.set('proximity.initialised', true);
}

export function start() {
  hw.front.start();

  // hw.frontSensor.on('data', _onFrontSensorData);
  // hw.rearSensor.on('data', _onRearSensorData);
  // hw.headSensor.on('data', _onHeadSensorData);
}

export function stop() {
  hw.front.stop();

  // hw.frontSensor.removeListener('data', _onFrontSensorData);
  // hw.rearSensor.removeListener('data', _onRearSensorData);
  // hw.headSensor.removeListener('data', _onHeadSensorData);
}

// === Private ===
/**
 * A custom Ultrasonic Sensor with the required pins and their speficied configuration
 */
class UltrasonicSensor {
  constructor(params, changeCallback) {
    this.trigger = new five.Pin({
      pin: params.triggerPin,
      mode: five.Pin.OUTPUT,
    });
    this.voltage = new five.Sensor({
      pin: params.voltagePin,
      freq: config.hardware.proximityReadPeriod,
      threshold: config.hardware.proximityChangeThreshold,
    });

    this._voltageChangeCallback = changeCallback;
  }

  /**
   * Start the sensor
   */
  start() {
    // Listen to the voltage pin `change` events, fire callback on event
    this.voltage.on('change', () => {
      this._voltageChangeCallback({
        value: this.voltage.value,
        voltage: this.voltage.fscaleTo(0, 5),
        cm: this._calculateCm(this.voltage.fscaleTo(0, 5)),
      });
    });

    // Start the trigger
    this.triggerInt = setInterval(this._pulseTrigger.bind(this), config.hardware.proximityTriggerPeriod);
  }

  /**
   * Stop the sensor
   */
  stop() {
    // Remove the voltage changed listener
    this.voltage.removeListener('change', this._voltageChangedCallback);

    // Stop the trigger
    clearInterval(this.triggerInt);
  }

  // === Private ===
  /**
   * Drive the trigger pin high for a specified length of time
   */
  _pulseTrigger() {
    this.trigger.high();
    setTimeout(() => {
      this.trigger.low();
    }, config.hardware.proximityTriggerLength);
  }

  /**
   * Convert the proximity reading to cm
   */
  _calculateCm(voltage) {
    return voltage * 10;
  }
}

/**
 * Check for proximity warnings and update the store based on new data from the front sensor
 * @param  {Object} event The event sent from the UltrasonicSensor instance
 */
function _onFrontSensorData(event) {
  const self = _onFrontSensorData;
  const mm = event.cm * 10;

  self.count++;

  // Only update the store every 5 readings
  if (self.count > 5) {
    store.hardwareState.set('proximity.values.front', mm);
    self.count = 0;
  }

  // Check for distance threshold warnings
  store.hardwareState.set('proximity.warn.front', checkObstacle('frontSensor', mm));
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
  if (dist < config.hardware.proximityThreshholds.shutdown[sensor]) {
    return 'shutdown';
  }

  if (dist < config.hardware.proximityThreshholds.warn[sensor]) {
    return 'warn';
  }

  return 'none';
}
