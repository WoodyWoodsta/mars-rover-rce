/* exit-obstacle-mode.es6 */
/**
 * Sequence invoked when the RCE is to exit obstacle mode
 *
 * Sequence:
 */

import debug from 'debug';
import * as store from '../store';

const log = debug('rce:sequence:exit-obstacle-mode');

export default function seq() {
  store.rceState.set('systemState', 'normal');
}
