/* store.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

/**
 * Store. Operates on a data-driven model in terms of socket notifications
 */
import debug from 'debug';
import objectPath from 'object-path';
import { EventEmitter } from 'eventemitter3';

import { rceIO } from './server';

const log = debug('rce:store');

/**
 * A store of data which allows declarative and imperative subscriptions to data changes as well as emits notifications of changes
 * to available and specified web sockets
 * @param {String}  name    The name of the data store. Is required to be the name of the `DataStore` instance
 * @param {String}  type    The primary direction of flow of data
 * @param {Object}  fields  The data fields to store
 * @param {Object}  watched An array of socket channel names or callback functions for specific data paths
 */
class DataStore extends EventEmitter {
  constructor(name, type = 'sink', pushOnCreate, fields = {}, watched = {}) {
    super();

    // Copy in fields
    Object.assign(this, fields);
    this._name = name;
    this._type = type;
    this._watched = watched;

    this._createAutoListeners();

    // Perform initial sync
    if (pushOnCreate) {
      this.repush();
    }
  }

  /**
   * Mutate the store, optionally notifying listeners on specific socket channels of the change
   * The mutation will also fire events pertaining to the path of the change and will do so for every node along the path tree,
   * downwards from the root.
   * NOTE: Mutating the store will automatically notify sockets as in notifyees
   * @param {String}                fullPath  The path of the property to change, relative to this `DataStore`
   * @param {Any}                   data      The new data
   * @param {Array/String/Function} notifyees Custom notification: the name of the socket channel to notify on, or an array of
   *                                          such names, or a callback function, or an array of callback functions or a mixed
   *                                          array of notifyees or callback functions :D
   */
  set(fullPath, data, notifyees = []) {
    this.receiveData(fullPath, fullPath, data, notifyees);
  }

  /**
   * Re-notify the notifyees of the data currently at the path specified
   * @type {Array}
   */
  repush(fullPath, notifyees = []) {
    if (!fullPath || fullPath === '*') {
      // Push the entire store
      Object.keys(this).forEach((key) => {
        if (key.charAt(0) !== '_') {
          this.set(key, objectPath.get(this, key), notifyees);
        }
      });
    } else {
      this.set(fullPath, objectPath.get(this, fullPath), notifyees);
    }
  }

  receiveData(fullPath, path, data, notifyees = []) {
    // Keep track of who is notified to prevent event duplication
    const notified = [];
    let dotIndex = 0;

    let tempObj = {};
    objectPath.set(tempObj, path, data);

    // Record old value
    let _oldValue = {};
    objectPath.set(_oldValue, path, objectPath.get(this, path));
    const oldValue = clone(_oldValue);

    // Mutate
    objectPath.set(this, fullPath, objectPath.get(tempObj, fullPath));

    // Copy new data
    let newValue = {};
    objectPath.set(newValue, path, data);

    // Emit notifications
    while (dotIndex > -1) {
      const sub = fullPath.slice(0, dotIndex || undefined);
      this._emitChange(fullPath, sub, objectPath.get(newValue, sub), objectPath.get(oldValue, sub));

      if (this._watched[sub]) {
        notified.push(sub);
      }

      dotIndex = fullPath.indexOf('.', dotIndex + 1);
    }

    this._climbDownPath(fullPath, path, objectPath.get(newValue, path), objectPath.get(oldValue, path));

    // Custom notify based on passed in `notifyees`. Will not duplicate
    if (notifyees) {
      customNotify(notified, this._name, fullPath, path, newValue, oldValue, notifyees);
    }
  }

  _emitChange(fullPath, path, newValue, oldValue) {
    this.emit(`${path}-changed`, {
      fullPath,
      path,
      newValue,
      oldValue,
    });
  }

  _climbDownPath(fullPath, path, newValue, oldValue) {
    if (newValue) {
      Object.keys(newValue).forEach((key) => {
        if (Object.prototype.toString.call(newValue) === '[object Object]') {
          this._climbDownPath(fullPath, `${path}.${key}`, newValue[key], (oldValue) ? (oldValue[key]) : undefined);
        }

        if (fullPath !== `${path}.${key}`) {
          this._emitChange(fullPath, `${path}.${key}`, newValue[key], (oldValue) ? (oldValue[key]) : undefined);
        }
      });
    }
  }

  _createAutoListeners() {
    Object.keys(this._watched).forEach((watchKey) => {
      if (this._watched[watchKey].length !== 0) {
        // Only listen if there are watchers in the array
        this.on(`${watchKey}-changed`, function onChanged(message) {
          setTimeout(() => {
            customNotify([], this._name, message.fullPath, message.path, message.newValue, message.oldValue, this._watched[watchKey]);
          }, 0);
        });
      }
    });
  }
}

/**
 * Store for the RCE state and telemetry
 * @member {Number} rceCpu      The percentage CPU usage taken up by the RCE Node process
 * @member {Number} rceMemory   The percentage of physically available memory taken up by the RCE Node process
 * @member {Number} camCpu      The percentage CPU usage taken up by the cam process
 * @member {Number} camMemory   The percentage of physically available memory taken up by the cam process
 * @member {Object} controller  The state of the rover function controller
 */
export const rceState = new DataStore('rceState', 'source', true, {
  rceIO: {
    connected: false,
  },
  rceCpu: undefined,
  rceMemory: undefined,
  camCpu: undefined,
  camMemory: undefined,

  systemState: undefined,

  updatingTrims: false,

  controller: {
    sequence: [],
    currentSequenceIndex: null,
    sequenceState: 'off',
    stateLoopRunning: false,
  },

  selfDiagnostics: {
    running: false,
    status: undefined,
  },

}, {
  rceCpu: ['rceIO'],
  rceMemory: ['rceIO'],
  camCpu: ['rceIO'],
  camMemory: ['rceIO'],
  controller: ['rceIO'],
  systemState: ['rceIO'],
  updatingTrims: ['rceIO'],
  selfDiagnostics: ['rceIO'],
});

/**
 * Store for the hardware state data
 * @member {Object} board     Data related to the `johnny-five` board
 * @member {Object} analog    Data related to the analog inputs
 * @member {Object} camera    Data related to the camera
 * @member {Object} leds      Data related to the LEDs
 * @member {Object} proximity Data related to the proximity sensors
 * @member {Object} servos    Data related to the servo motors
 */
export const hardwareState = new DataStore('hardwareState', 'source', true, {
  board: {
    initialised: false,
  },
  analog: {
    initialised: false,
    values: {
      battery: 0,
    },
    warnings: {
      battery: 'none',
    },
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
    running: false,
    values: {
      front: 0,
      rear: 0,
      head: 0,
    },
    warn: {
      front: false,
      rear: false,
      head: false,
    },
  },
  servos: {
    initialised: false,
    values: {
      driveFrontLeft: 0,
      driveFrontRight: 0,
      driveRearLeft: 0,
      driveRearRight: 0,
      steerFrontLeft: 0,
      steerFrontRight: 0,
      steerRearLeft: 0,
      steerRearRight: 0,
      headPan: 0,
      headPitch: 0,
    },
  },

  trims: {
    servos: {
      offset: {
        driveFrontLeft: 2,
        driveFrontRight: -1,
        driveRearLeft: 1,
        driveRearRight: -1,
        steerFrontLeft: 0,
        steerFrontRight: 0,
        steerRearLeft: 0,
        steerRearRight: -20,
        headPan: 6,
        headPitch: 0,
      },

      multiplier: {
        driveFrontLeft: 0.3,
        driveFrontRight: 0.3,
        driveRearLeft: 0.3,
        driveRearRight: 0.3,
        steerFrontLeft: 1,
        steerFrontRight: 1,
        steerRearLeft: 1,
        steerRearRight: 1,
        headPan: 1,
        headPitch: 1,
      },
    },
  },
}, {
  board: ['rceIO'],
  analog: ['rceIO'],
  camera: ['rceIO'],
  leds: ['rceIO'],
  proximity: ['rceIO'],
  servos: ['rceIO'],
  trims: ['rceIO'],
});

/**
 * Store for the control input
 * @member {String} type        The control mode that the client is in ['interactive', 'rose']
 * @member {Object} driveInput  The input values from the drive joystick
 * @member {Object} headInput   The input values from the head joystick
 * @member {Object} testLED     The state of the test LED
 */
export const control = new DataStore('control', 'sink', false, {
  type: '',

  driveInput: {
    xMag: 0,
    yMag: 0,
  },

  headInput: {
    xMag: 0,
    yMag: 0,
  },

  buttons: {
    rotateCW: false,
    rotateCCW: false,
  },

  testLED: {
    isOn: false,
  },
});

/**
 * The entire set of stores
 */
export const stores = {
  rceState,
  hardwareState,
  control,
};

// === Private ===
function customNotify(notified, name, fullPath, path, newValue, oldValue, notifyees) {
  // Handle all types
  if (typeof notifyees === 'string') {
    // One notifyee
    if (!notified.includes(notifyees)) {
      notifyMutate(notifyees, name, fullPath, path, newValue, oldValue);
      notified.push(notifyees);
    }
  } else if (notifyees.constructor === Array) {
    // Multiple notifyees
    notifyees.forEach((notifyee) => {
      // Handle all types
      if (typeof notifyee === 'function') {
        notifyee(newValue, oldValue, path);
      } else if (!notified.includes(notifyee)) {
        // Do not notify more than once
        notifyMutate(notifyee, name, fullPath, path, newValue, oldValue);
        notified.push(notifyee);
      }
    });
  } else if (typeof notifyees === 'function') {
    notifyees(newValue, oldValue, path, fullPath);
  } else {
    log('Notifyee list is not a string nor an array');
  }
}

/**
 * Emit a notification of a mutation on a store property
 * @param  {String} notifyee  The socket on which to send the notification
 * @param  {String} storeName The name of the store concerned
 * @param  {String} path      The property path of the property that was mutated
 * @param  {any}    oldValue  The previous value
 * @param  {any}    newValue  The new value
 */
function notifyMutate(notifyee, storeName, fullPath, path, newValue, oldValue) {
  // Construct message to send
  const message = {
    type: 'mutate',
    storeName,
    fullPath,
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

function clone(src) {
  function mixin(dest, source, copyFunc) {
    const empty = {};
    let name;
    let s;

    for (name in source) {
      // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
      // inherited from Object.prototype. For example, if dest has a custom toString() method,
      // don't overwrite it with the toString() method that source inherited from Object.prototype
      s = source[name];
      if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
        dest[name] = copyFunc ? copyFunc(s) : s;
      }
    }
    return dest;
  }

  if (!src || typeof src !== 'object' || Object.prototype.toString.call(src) === '[object Function]') {
    // null, undefined, any non-object, or function
    return src; // anything
  }
  if (src.nodeType && 'cloneNode' in src) {
    // DOM Node
    return src.cloneNode(true); // Node
  }
  if (src instanceof Date) {
    // Date
    return new Date(src.getTime()); // Date
  }
  if (src instanceof RegExp) {
    // RegExp
    return new RegExp(src); // RegExp
  }
  let r;
  let i;
  let l;
  if (src instanceof Array) {
    // array
    r = [];
    for (i = 0, l = src.length; i < l; ++i) {
      if (i in src) {
        r.push(clone(src[i]));
      }
    }
  } else {
    // generic objects
    r = src.constructor ? new src.constructor() : {};
  }
  return mixin(r, src, clone);
}
