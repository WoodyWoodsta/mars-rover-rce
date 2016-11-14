/* socket.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';
import Socket from 'koa-socket';
import rceIO from './rce-io';

const log = debug('rce:socket-server');

/**
 * Initialise the RCEIO socket
 */
export function init() {
  // Namespaces
  return new Socket('rce-io');
}

/**
 * Add listeners to the existing socket instance
 * @param {Object} socket The socket to add listeners to
 */
export function addListeners(socket) {
  rceIO(socket);
}
