/* trims.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import fs from 'fs';
import path from 'path';
import debug from 'debug';

import * as store from '../store';

const log = debug('rce:trims');

const SERVOS_FILEPATH = path.join(__dirname, 'servo-trims.json');
const PROXIMITY_FILEPATH = path.join(__dirname, 'proximity-trims.json');

/**
 * Local record of the servo trims
 */
export let servos = {
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
};

/**
 * Local record of the proximity trims
 */
export let proximity = {
  modifiers: {
    front: _frontUsSensorMod,
    rear: _rearUsSensorMod,
    head: _headUsSensorMod,
  },
};

/**
 * Initialise the trims module, saving or retreiving trim data from the filesystem
 */
export function init() {
  log('Checking for saved trim data...');

  // Servos trims first check and load
  if (!fs.existsSync(SERVOS_FILEPATH)) {
    save('servos');
  } else {
    readSaved('servos');
  }

  store.hardwareState.on('trims.servos-changed', _onServosChanged);
  log('Trims loaded');
}

/**
 * Save the currently set trim data to a file
 * @param  {String} group The group of trim data to save (saved in separate files). Omit for both
 */
export function save(group) {
  if (!group || group === 'servos') {
    fs.writeFileSync(SERVOS_FILEPATH, JSON.stringify(servos));
  }

  log('Trims saved to file');
}

/**
 * Reads in the saved trim files, if they exist
 * @param  {String} group The group of trim data to read (saved in different files). Omit for both
 */
export function readSaved(group) {
  if ((!group || group === 'servos') && fs.existsSync(SERVOS_FILEPATH)) {
    servos = JSON.parse(fs.readFileSync(SERVOS_FILEPATH));
    store.hardwareState.set('trims.servos', servos);
  }
}

// === Modifiers ===
function _frontUsSensorMod(value) {
  return value;
}

function _rearUsSensorMod(value) {
  return value;
}

function _headUsSensorMod(value) {
  return value;
}

// === Private ===
/**
 * Trigger an update of the servo values when the servo trims changed
 * @param  {Object} event The incoming property change event
 */
function _onServosChanged(event) {
  servos = event.newValue;

  store.rceState.set('updatingTrims', true);
}
