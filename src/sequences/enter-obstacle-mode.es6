/* enter-obstacle-mode.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

/**
 * Sequence invoked in case of an emergency (i.e. when an obstacle is detected or if the rover has run out of battery)
 *
 * Sequence:
 *  - Signal
 *  - Return all servos to zero
 */

import debug from 'debug';
import * as store from '../store';

const log = debug('rce:sequence:obstacle');

/**
 * enter obstacle sequence
 */
export default function seq() {
  // Indicate a change of mode
  store.rceState.set('systemState', 'obstacle');

  // Set the servos to zero (all we really need to do here is stop the wheels)
  // NOTE: This is handled by the state driver already, based on the store property
}
