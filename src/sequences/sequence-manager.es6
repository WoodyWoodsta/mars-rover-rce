/* sequence-manager.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';

import startup from './startup';
import powerDown from './power-down';
import emergencyShutdown from './emergency-shutdown';
import enterObstacleMode from './enter-obstacle-mode';
import exitObstacleMode from './exit-obstacle-mode';
import selfDiagnostics from './self-diagnostics';

const log = debug('rce:system-sequences');

/**
 * Execute a sequence from the list of available sequences
 * @param  {String}   name     The name of the sequence
 * @param  {Function} callback A callback function to invoke when the sequential components of the sequence have completed
 */
export function exec(name, callback) {
  if (sequences[name]) {
    sequences[name]();
  } else {
    log(`No sequence '${name} exists!'`);
  }

  if (callback) {
    callback();
  }
}

/**
 * The available sequences as imported
 */
export const sequences = {
  startup,
  powerDown,
  emergencyShutdown,
  enterObstacleMode,
  exitObstacleMode,
  selfDiagnostics,
};
