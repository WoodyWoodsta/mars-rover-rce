/* index.es6 */
import debug from 'debug';

import startup from './sequences/startup';

const log = debug('rce:main');

log('Mars Curiosity Rover RCE is starting up...');

// Fire the startup sequence
startup();
