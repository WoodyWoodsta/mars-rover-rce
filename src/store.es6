/* store.es6 */
/**
 * Store. Operates on a data-driven model in terms of socket notifications
 */
import debug from 'debug';
import objectPath from 'object-path';

import { rceIO } from './server';

const log = debug('rce:store');

/**
 * State data of the system in general
 * SOURCE
 */
export const rceState = {
  rceCpu: undefined,
  rceMemory: undefined,
  camCpu: undefined,
  camMemory: undefined,
  _watched: {
    rceCpu: ['rceIO'],
    rceMemory: ['rceIO'],
    camCpu: ['rceIO'],
    camMemory: ['rceIO'],
  },
  _type: 'source',
};

/**
 * State data of hardware, for telemetry purposes
 * SOURCE
 */
export const hardwareState = {
  board: {
    initialised: false,
  },
  analog: {
    initialised: false,
  },
  camera: {
    initialised: false,
    running: false,
  },
  leds: {
    initialised: false,
  },
  proximity: {
    initialised: false,
  },
  servos: {
    initialised: false,
  },

  _watched: {
    board: ['rceIO'],
    analog: ['rceIO'],
    camera: ['rceIO'],
    leds: ['rceIO'],
    proximity: ['rceIO'],
    servos: ['rceIO'],
  },
  _type: 'source',
};

/**
 * Control input data, received from the controller
 * SINK
 */
export const control = {
  driveInput: {
    xMag: 0,
    yMag: 0,
  },

  _watched: {
  },
  _type: 'sink',
};

/**
 * The entire set of stores
 */
export const stores = {
  rceState,
  hardwareState,
  control,
};

/**
 * Mutate the store, optionally notifying listeners on specific socket channels of the change
 * NOTE: Mutating the store will automatically notify according to the `_watched` array in each store object
 * @param {String}                path      The path of the property to change
 * @param {Any}                   data      The new data
 * @param {Array/String/Function} notifyees Custom notification: the name of the socket channel to notify on, or an array of
 *                                          such names, or a callback function, or an array of callback functions or a mixed
 *                                          array of notifyees or callback functions :D
 */
export function set(path, data, notifyees) {
  // Record of notified
  const notified = [];

  // Record and mutate
  const baseDotIdx = path.indexOf('.');
  let dotIndex = 0;
  const base = path.slice(0, baseDotIdx);
  const key = path.slice(baseDotIdx + 1);

  const oldValue = objectPath.get(stores, path);
  objectPath.set(stores, path, data);

  while (dotIndex > -1) {
    const sub = key.slice(0, dotIndex || undefined);
    if (stores[base]._watched[sub]) {
      stores[base]._watched[sub].forEach((notifyee) => {
        // Handle all types
        if (typeof notifyee === 'function') {
          notifyee(data, oldValue, path);
        } else {
          notifyMutate(notifyee, base, path, oldValue, data);
          notified.push(notifyee);
        }
      });

      break;
    }

    dotIndex = key.indexOf('.', dotIndex + 1);
  }

  // Custom Notify
  if (notifyees) {
    // Handle all types
    if (typeof notifyees === 'string') {
      // One notifyee
      if (!notified.includes(notifyees)) {
        notifyMutate(notifyees, base, path, data, oldValue);
        notified.push(notifyees);
      }
    } else if (notifyees.constructor === Array) {
      // Multiple notifyees
      notifyees.forEach((notifyee) => {
        // Handle all types
        if (typeof notifyee === 'function') {
          notifyee(data, oldValue, path);
        } else if (!notified.includes(notifyee)) {
          // Do not notify more than once
          notifyMutate(notifyee, base, path, data, oldValue);
          notified.push(notifyee);
        }
      });
    } else if (typeof notifyees === 'function') {
      notifyees(data, oldValue, path);
    } else {
      log('Notifyee list is not a string nor an array');
    }
  }
}

// === Private ===
/**
 * Emit a notification of a mutation on a store property
 * @param  {String} notifyee  The socket on which to send the notification
 * @param  {String} storeName The name of the store concerned
 * @param  {String} path      The property path of the property that was mutated
 * @param  {any}    oldValue  The previous value
 * @param  {any}    newValue  The new value
 */
function notifyMutate(notifyee, storeName, path, oldValue, newValue) {
  // Construct message to send
  const message = {
    type: 'mutate',
    storeName,
    path,
    data: {
      oldValue,
      newValue,
    },
  };

  // Notify
  switch (notifyee) {
    case 'rceIO':
      rceIO.broadcast('data', message);
      break;
    default:
      log('Attempted notification failed, no such notifyee');
      break;
  }
}
