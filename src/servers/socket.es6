/* socket.es6 */
import debug from 'debug';
import Socket from 'koa-socket';
import rceIO from './rce-io';

const log = debug('rce:socket-server');

export function init() {
  // Namespaces
  return new Socket('rce-io');
}

export function addListeners(socket) {
  rceIO(socket);
}
