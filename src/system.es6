/* system.es6 */
/**
 * Linux system and board related operations
 */
import debug from 'debug';
import MonitorPid from 'monitor-pid';

import * as store from './store';
import { config } from './config';
import { camProcessPid } from './hardware/camera';

const log = debug('rce:system');

export const rceMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });
// Temporarily set cam pid to the node process pid for safety
export const camMonitor = new MonitorPid(process.pid, { period: config.systemMonitor.period });

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

rceMonitor.on('error', (err) => {
  log(`RCE Process Monitor reported error: ${err}`);
  rceMonitor.stop();
});

camMonitor.on('error', (err) => {
  log(`Cam Process Monitor reported error: ${err}`);
  camMonitor.stop();
});

rceMonitor.on('monitored', (pid, stats) => {
  store.set('rceState.rceCpu', stats['%CPU']);
  store.set('rceState.rceMemory', stats['%MEM']);
});

camMonitor.on('monitored', (pid, stats) => {
  store.set('rceState.camCpu', stats['%CPU']);
  store.set('rceState.camMemory', stats['%MEM']);
});
