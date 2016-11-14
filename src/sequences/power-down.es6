/* power-down.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

/**
 * Sequence invoked on power down of the rover (termination of the RCE)
 *
 * Sequence:
 *  - Kill the camera process
 */

import debug from 'debug';

import { stop as cameraStop } from '../hardware/camera';

const log = debug('rce:sequence:power-down');

/**
 * power down sequence
 */
export default function seq() {
  log('RCE is exiting...');

  // Shut down the camera
  cameraStop(true, () => {
    process.exit();
  });
}
