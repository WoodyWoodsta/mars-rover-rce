/* system.es6 */
/**
 * Linux system and board related operations
 */
import debug from 'debug';
import MonitorPid from 'monitor-pid';

import * as store from './store';
import { config } from './config';
import { camProcessPid, stop as cameraStop } from './hardware/camera';

const log = debug('rce:system');

export const rceMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });
// Temporarily set cam pid to the node process pid for safety
export const camMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });

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

export function stopProcessMonitoring() {
  rceMonitor.stop();
  camMonitor.stop();

  log('Process monitoring stopped');
}

// === Private ===
function _onBeforeExit() {
  cameraStop(true, () => {
    process.exit();
  });

  log('RCE is exiting...');
}
