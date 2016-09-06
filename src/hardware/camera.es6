/* leds.es6 */
import debug from 'debug';
import child from 'child_process';
import path from 'path';

import { config } from '../config';
import { killAll } from '../utils/kill-all';

const log = debug('rce:camera');

let camProcess = null;
let retry = 0;

/**
 * The hardware associated with this sub-abstraction
 * @type {Object}
 */
export let hw = {};

/**
 * Initialise the camera
 */
export function init(callback) {
  start();
  log('Camera intialised');
}

export function stop() {
  killAll(camProcess.pid, 'SIGINT');
  log('Camera stopped');
  // TODO: Notify of the camera stopping
}

// === Private ===
function start() {
  camProcess = child.exec(config.hardware.cameraStartCmdLine, (err) => {
    log(`Camera closed with${(err) ? '' : 'out'} error${(err) ? `: ${err}` : ''}`);

    // Only retry if below the max number of retries
    if (++retry !== config.hardware.cameraMaxRetry) {
      start();
    } else {
      // TODO: Notify of failed intialisation
      log('Camera max retries reached. Closing subsystem');
      retry = 0;
      return;
    }
  });

  process.on('beforeExit', () => {
    stop();
  });

  process.on('exit', () => {
    console.log('I am exiting');
  });
}
