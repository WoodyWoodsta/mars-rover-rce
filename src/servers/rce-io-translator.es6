/* rce-io-translator.es6 */
import * as store from '../store';

/**
 * Handle incomming messages of type data
 * @param  {Object} message The incomming message
 */
export function onData(message) {
  switch (message.data.storeName) {
    case 'control':
      store.control.receiveData(message.data.fullPath, message.data.path, message.data.data.newValue);
      break;
    case 'server':
      store.server.receiveData(message.data.fullPath, message.data.path, message.data.data.newValue);
      break;
    default:
  }
}

export function onPost(event) {
  switch (event.type) {
    case 'upload-sequence':
      store.rceState.set('controller.sequence', event.data);
      break;
    default:

  }
}
