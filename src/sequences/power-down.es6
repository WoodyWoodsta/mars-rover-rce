/* power-down.es6 */
/**
 * Sequence invoked on power down of the rover (termination of the RCE)
 *
 * Sequence:
 */

import debug from 'debug';

import { stop as cameraStop } from '../hardware/camera';

const log = debug('rce:sequence:power-down');

export default function seq() {
  log('RCE is exiting...');

  // Shut down the camera
  cameraStop(true, () => {
    process.exit();
  });
}
