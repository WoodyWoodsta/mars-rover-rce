/* index.es6 */
import debug from 'debug';

import server from './server';
import board from './hardware/board';

const log = debug('rce:main');

log('Mars Curiosity Rover RCE is starting up...');
server();
board();
