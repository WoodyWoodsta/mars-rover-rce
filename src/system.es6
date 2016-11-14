/* system.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

/**
 * Linux system and board related operations
 */
import debug from 'debug';
import MonitorPid from 'monitor-pid';

import * as store from './store';
import { config } from './config';
import { camProcessPid } from './hardware/camera';
import * as sequenceManager from './sequences/sequence-manager';

const log = debug('rce:system');

export const rceMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });
// Temporarily set cam pid to the node process pid for safety
export const camMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });

/**
 * Initialise the system components
 */
export function init() {
  rceMonitor.on('error', (err) => {
    log(`RCE Process Monitor reported error: ${err}`);
    rceMonitor.stop();
  });

  camMonitor.on('error', (err) => {
    log(`Cam Process Monitor reported error: ${err}`);
    camMonitor.stop();
  });

  rceMonitor.on('monitored', (pid, stats) => {
    store.rceState.set('rceCpu', stats['%CPU']);
    store.rceState.set('rceMemory', stats['%MEM']);
  });

  camMonitor.on('monitored', (pid, stats) => {
    store.rceState.set('camCpu', stats['%CPU']);
    store.rceState.set('camMemory', stats['%MEM']);
  });

  store.hardwareState.on('camera.running-changed', (event) => {
    if (event.newValue) {
      camMonitor.start();
    } else {
      camMonitor.stop();
    }
  });

  process.on('SIGINT', _onBeforeExit);
  process.on('beforeExit', _onBeforeExit);
}

/**
 * Start monitoring camera and RCE processes
 */
export function startProcessMonitoring() {
  rceMonitor.start();

  if (store.hardwareState.camera.running) {
    camMonitor.pid = camProcessPid;
    camMonitor.start();
  } else {
    log('Camera is not running, therefore, not monitoring');
  }

  log('Process monitoring started');
}

/**
 * Stop monitoring the camera and RCE processes
 */
export function stopProcessMonitoring() {
  rceMonitor.stop();
  camMonitor.stop();

  log('Process monitoring stopped');
}

// === Private ===
/**
 * Cath the exit event and execute the powerdown sequence when this is detected
 */
function _onBeforeExit() {
  sequenceManager.exec('powerDown');
}
