/* emergency-shutdown.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

/**
 * Sequence invoked in case of an emergency (i.e. when an obstacle is detected or if the rover has run out of battery)
 *
 * Sequence:
 *  - Signal
 *  - Return all servos to zero
 *  - Deinit everything
 */

import debug from 'debug';
import * as store from '../store';

const log = debug('rce:sequence:emergency-shutdown');

/**
 * emergency shutdown sequence
 */
export default function seq() {
  store.rceState.set('systemState', 'emergency-shutdown');

  // Set all the servos to zero
  // NOTE: This is handled by the state driver already, based on the store property

  // Deinit everything
}
