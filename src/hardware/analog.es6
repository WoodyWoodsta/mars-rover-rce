/* analog.es6 */
import debug from 'debug';
import * as five from 'johnny-five';

import { config } from '../config';
import * as store from '../store';

const log = debug('rce:analog');

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};

/**
 * Initialise the analog battery sensor
 */
export function init() {
  hw.battery = new five.Sensor({
    pin: config.hardware.batterySensorPin,
    freq: config.hardware.batterySensorReadPeriod,
    threshold: config.hardware.batterySensorChangeThreshold,
  });

  store.hardwareState.set('analog.initialised', true);

  hw.battery.on('change', () => {
    const voltage = hw.battery.fscaleTo(0, 12.45);
    store.hardwareState.set('analog.values.battery', voltage);

    if (voltage <= config.hardware.lowBatteryVoltage && voltage > config.hardware.criticalBatteryVoltage) {
      if (store.hardwareState.analog.warnings.battery !== 'low') {
        store.hardwareState.set('analog.warnings.battery', 'low');
      }
    } else if (voltage <= config.hardware.criticalBatteryVoltage) {
      if (store.hardwareState.analog.warnings.battery !== 'critical') {
        store.hardwareState.set('analog.warnings.battery', 'critical');
      }
    } else if (store.hardwareState.analog.warnings.battery !== 'none') {
      store.hardwareState.set('analog.warnings.battery', 'none');
    }
  });
}
