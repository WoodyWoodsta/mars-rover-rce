/* leds.es6 */
import debug from 'debug';
import child from 'child_process';
import path from 'path';

import { config } from '../config';
import { killAll } from '../utils/kill-all';
import * as store from '../store';

const log = debug('rce:camera');

let camProcess = null;
let retry = 0;

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};
export let camProcessPid;

/**
 * Initialise the camera
 */
export function init(callback) {
  start();
  log('Camera intialised');
  store.hardwareState.set('camera.initialised', true);
  store.hardwareState.set('camera.running', true);
}

export function stop() {
  killAll(camProcess.pid, 'SIGINT');
  log('Camera stopped');
  store.hardwareState.set('camera.running', false);
}

// === Private ===
function start() {
  camProcess = child.exec(config.hardware.cameraStartCmdLine, (err) => {
    log(`Camera closed with${(err) ? '' : 'out'} error${(err) ? `: ${err}` : ''}`);

    // Only retry if below the max number of retries
    if (++retry !== config.hardware.cameraMaxRetry) {
      start();
    } else {
      store.hardwareState.set('camera.running', false);
      log('Camera max retries reached. Closing subsystem');
      retry = 0;
      return;
    }
  });

  camProcessPid = camProcess.pid;

  process.on('beforeExit', () => {
    stop();
  });

  process.on('exit', () => {
    console.log('I am exiting');
  });
}
