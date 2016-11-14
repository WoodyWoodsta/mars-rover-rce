/* index.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';

import * as sequenceManager from './sequences/sequence-manager';
import * as store from './store';

const log = debug('rce:main');

log('Mars Curiosity Rover RCE is starting up...');

// Fire the startup sequence
sequenceManager.exec('startup', () => {
  store.rceState.set('systemState', 'normal');
});
