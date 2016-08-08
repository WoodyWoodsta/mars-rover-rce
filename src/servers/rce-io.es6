/* rce-io.es6 */
import debug from 'debug';

const log = debug('rce:socket');

export default function init(socket) {
  socket.on('connection', ctx => {
    log('Received a connection');
  });
}
