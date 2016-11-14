/* rce-io-translator.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';

import * as store from '../store';
import * as rceIO from './rce-io';
import { save as saveTrims } from '../hardware/trims';
import * as sequenceManager from '../sequences/sequence-manager';

const log = debug('rce:rce-io-translator');

// === Incoming ===
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

/**
 * Handle incoming post messages
 * @param  {Object} event The incoming property change event
 */
export function onPost(event) {
  switch (event.data.type) {
    case 'upload-sequence':
      store.rceState.set('controller.sequence', event.data.payload);
      break;
    case 'playback-sequence':
      store.rceState.set('controller.sequenceState', 'running');
      break;
    case 'update-trims':
      store.hardwareState.set('trims.servos', event.data.payload);
      break;
    case 'run-self-diagnostics':
      sequenceManager.exec('selfDiagnostics');
      break;
    default:

  }
}

/**
 * Handle incoming request messages
 * @param  {Object} event The incoming property change event
 */
export function onRequest(event) {
  switch (event.data.type) {
    // REVIEW: This should never be done if the request came from a Client, the rsvp server should *always* handle repush requests
    // as it will be more capable of doing so for large numbers of clients
    case 'repush':
      if (store[event.data.payload.storeName]) {
        store[event.data.payload.storeName].repush(event.data.payload.path, event.data.payload.notifyees);
      } else {
        log(`No such store '${event.data.payload.storeName}' found`);
      }
      break;
    case 'save-trims':
      saveTrims();
      break;
    default:

  }
}

// === Outgoing ===
/**
 * Request a repush from a remote store
 * @param  {String} storeName      The name of the remote store
 * @param  {String} path           The path of the store to repush, or '*' for the entire thing
 * @param  {Array}  [notifyees=[]] Custom notifiyees
 */
export function requestRepush(storeName, path, notifyees = []) {
  rceIO.sendRequest('repush', { storeName, path, notifyees });
}
