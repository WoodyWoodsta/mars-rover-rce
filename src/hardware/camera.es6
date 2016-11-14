/* camera.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

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

/**
 * Stop the camera process
 * @param  {String}   exit     The type of exit that should be used to kill the process
 * @param  {Function} callback A callback invoked in the event of an error?
 */
export function stop(exit, callback) {
  if (!exit) {
    store.hardwareState.set('camera.running', false);
  }

  if (camProcess) {
    killAll(camProcess.pid, 'SIGINT', callback);
    log('Camera stopped');
  } else {
    callback();
  }
}

// === Private ===
/**
 * Spawn the child process, and retry for a specified number of times upon unsuccessful invocation
 */
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

  camProcess.on('exit', (code, sig) => {
    log(`Camera exited with code: ${code} (${sig})`);
  });

  camProcessPid = camProcess.pid;
}
