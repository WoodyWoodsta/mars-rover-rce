/* rce-io.es6 */
import debug from 'debug';

import * as rceIOTranslator from './rce-io-translator';

const log = debug('rce:socket');

export default function init(socket) {
  socket.on('connection', () => {
    log('Received a connection');
  });

  socket.on('test', () => {
    log('Received a test message on rce-io');
  });

  socket.on('data', (message) => {
    rceIOTranslator.onData(message);
  });
}
