/* rce-io.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';

import * as store from '../store';
import * as rceIOTranslator from './rce-io-translator';

const log = debug('rce:socket');

let rceIO;

/**
 * Initialise the socket instance and attach the associated handlers to it
 * @param  {Object} socket The socket instance
 */
export default function init(socket) {
  rceIO = socket;

  socket.on('connection', () => {
    store.rceState.set('rceIO.connected', true);
  });

  socket.on('test', () => {
    log('Received a test message on rce-io');
  });

  socket.on('data', rceIOTranslator.onData);
  socket.on('post', rceIOTranslator.onPost);
  socket.on('request', rceIOTranslator.onRequest);
}

/**
 * Send a request messahe
 * @param  {String} type    The request type
 * @param  {Any}    payload The data associated with the message
 */
export function sendRequest(type, payload) {
  rceIO.broadcast('request', { type, payload });
}
