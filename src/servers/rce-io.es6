/* rce-io.es6 */
import debug from 'debug';

const log = debug('rce:socket');

export default function init(socket) {
  socket.on('connection', () => {
    log('Received a connection');
  });

  socket.on('test', () => {
    log('Received a test message on rce-io');
  });
}

export function sendTele(type, source, data) {
  
}
