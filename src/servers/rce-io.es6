/* rce-io.es6 */
import debug from 'debug';

import * as store from '../store';
import * as rceIOTranslator from './rce-io-translator';

const log = debug('rce:socket');

export default function init(socket) {
  socket.on('connection', () => {
    store.rceState.set('rceIO.connected', true);
  });

  socket.on('test', () => {
    log('Received a test message on rce-io');
  });

  socket.on('data', rceIOTranslator.onData);

  socket.on('post', rceIOTranslator.onPost);
}
