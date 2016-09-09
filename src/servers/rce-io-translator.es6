/* rce-io-translator.es6 */
import * as store from '../store';

/**
 * Handle incomming messages of type data
 * @param  {Object} message The incomming message
 */
export function onData(message) {
  switch (message.data.storeName) {
    case 'control':
      store.control.set(message.data.path, message.data.data.newValue);
      break;
    case 'server':
      store.server.set(message.data.path, message.data.data.newValue);
      break;
    default:
  }
}
