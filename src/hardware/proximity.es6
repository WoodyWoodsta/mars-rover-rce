/* proximity.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';
import * as five from 'johnny-five';

import { config } from '../config';
import * as store from '../store';
import * as sequenceManager from '../sequences/sequence-manager';

const log = debug('rce:proximity');

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};

/**
 * Initialise the sensors
 */
export function init() {
  _onFrontSensorData.count = 0;
  _onRearSensorData.count = 0;
  _onHeadSensorData.count = 0;

  // Setup sensors
  hw = {
    front: new UltrasonicSensor({
      triggerPin: config.hardware.proximityTriggerPins.front,
      voltagePin: config.hardware.proximityVoltagePins.front,
    }, _onFrontSensorData),

    rear: new UltrasonicSensor({
      triggerPin: config.hardware.proximityTriggerPins.rear,
      voltagePin: config.hardware.proximityVoltagePins.rear,
    }, _onRearSensorData),

    head: new UltrasonicSensor({
      triggerPin: config.hardware.proximityTriggerPins.head,
      voltagePin: config.hardware.proximityVoltagePins.head,
    }, _onHeadSensorData),
  };

  store.hardwareState.set('proximity.initialised', true);
  log('Proximity initialised');
}

/**
 * Start the proximity system
 */
export function start() {
  if (store.hardwareState.proximity.running) {
    log('Proximity system is already running');
    return;
  }

  // Manually activate 'nav' proximity at the start
  hw.front.start();
  hw.rear.start();

  store.hardwareState.set('proximity.running', true);
  store.hardwareState.set('proximity.activeGroup', 'nav');

  store.hardwareState.on('proximity.warn.front-changed', _onProximityWarn);
  store.hardwareState.on('proximity.warn.rear-changed', _onProximityWarn);
}

/**
 * Stop the proximity system
 */
export function stop() {
  hw.front.stop();
  hw.rear.stop();
  hw.head.stop();

  store.hardwareState.set('proximity.running', false);
}

/**
 * Handle deinit and init of sensors based on the sensor group to activateSensorGroup
 * @param  {String} group The group of sensors to activate
 */
export function activateSensorGroup(group) {
  if (store.hardwareState.proximity.activeGroup === 'nav' && group === 'head') {
    // Stop nav group sensors
    hw.front.stop();
    hw.rear.stop();

    // Start head group sensors
    hw.head.start();
    store.hardwareState.set('proximity.activeGroup', 'head');
  } else if (store.hardwareState.proximity.activeGroup === 'head' && group === 'nav') {
    // Stop head group sensors
    hw.head.stop();

    // Start nav group sensors
    hw.front.start();
    hw.rear.start();

    store.hardwareState.set('proximity.activeGroup', 'head');
  }
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
    // Start the trigger
    this.triggerInt = setInterval(this._pulseTrigger.bind(this), config.hardware.proximityTriggerPeriod);

    // Wait for the RC circuit to charge up
    setTimeout(() => {
      // Listen to the voltage pin `change` events, fire callback on event
      this.voltage.on('change', () => {
        // Ensure non-blocking
        setImmediate(() => {
          this._voltageChangeCallback({
            value: this.voltage.value,
            voltage: this.voltage.fscaleTo(0, 5),
            cm: this._calculateCm(this.voltage.fscaleTo(0, 5)),
          });
        });
      });
    }, 800);
  }

  /**
   * Stop the sensor
   */
  stop() {
    // Remove the voltage changed listener
    this.voltage.removeListener('change', this._voltageChangedCallback);

    // Stop the trigger
    if (this.triggerInt) {
      clearInterval(this.triggerInt);
      this.triggerInt = undefined;
    }
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

/**
 * Check for proximity warnings and update the store based on new data from the rear sensor
 * @param  {Object} event The event sent from the UltrasonicSensor instance
 */
function _onRearSensorData(event) {
  const self = _onRearSensorData;
  const mm = event.cm * 10;

  self.count++;

  // Only update the store every 5 readings
  if (self.count > 5) {
    store.hardwareState.set('proximity.values.rear', mm);
    self.count = 0;
  }

  // Check for distance threshold warnings
  store.hardwareState.set('proximity.warn.rear', checkObstacle('rearSensor', mm));
}

/**
 * Check for proximity warnings and update the store based on new data from the head sensor
 * @param  {Object} event The event sent from the UltrasonicSensor instance
 */
function _onHeadSensorData() {
  const self = _onRearSensorData;
  const mm = event.cm * 10;

  self.count++;

  // Only update the store every 5 readings
  if (self.count > 5) {
    store.hardwareState.set('proximity.values.head', mm);
    self.count = 0;
  }

  // Check for distance threshold warnings
  store.hardwareState.set('proximity.warn.head', checkObstacle('frontSensor', mm));
}

/**
 * Check for "obstacles" based on sensor reading
 * @param  {String} sensor The sensor name for threshold lookups
 * @param  {Number} dist   The distance reading in mm
 * @return {String}        The warning
 */
function checkObstacle(sensor, dist) {
  if (dist < config.hardware.proximityThresholds.shutdown[sensor]) {
    return 'shutdown';
  }

  if (dist < config.hardware.proximityThresholds.warn[sensor]) {
    return 'warn';
  }

  return 'none';
}

/**
 * On a proximity warning, indicate that there is an obstacle
 * @param  {Object} event The data change event
 */
function _onProximityWarn(event) {
  if (event.newValue === 'shutdown') {
    sequenceManager.exec('enterObstacleMode');
  } else if (store.rceState.systemState === 'obstacle'
    && store.hardwareState.proximity.warn.front !== 'shutdown'
    && store.hardwareState.proximity.warn.rear !== 'shutdown') {
    // Exit obstacle mode if the proximity sensors show no obstacle
    sequenceManager.exec('exitObstacleMode');
  }
}
