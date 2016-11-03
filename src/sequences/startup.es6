/* startup.es6 */
/**
 * The very first sequence run at startup of the rover
 *
 * Sequence:
 *  - Start the servers ✓
 *  - Initialise the board ✓
 *  - Register board listeners
 *  - Initialise analog inputs ✓
 *  - Check vitals: only proceed if vitals pass
 *  - Initialise leds ✓
 *  - Initialise servos ✓
 *  - Initialise proximity sensors ✓
 *  - Initialise camera ✓
 *  - Establish connection with RSVP server
 *    - Sockets
 *    - WebRTC
 *    - Send all initial data (perhaps this needs to be requested from the )
 *  - Fire "standard system test" sequence
 */
import debug from 'debug';

import server from '../server';
import * as boardDriver from '../hardware/board';
import * as leds from '../hardware/leds';
import * as analog from '../hardware/analog';
import * as servos from '../hardware/servos';
import * as camera from '../hardware/camera';
import * as proximity from '../hardware/proximity';
import * as system from '../system';
import * as store from '../store';
import * as stateLoop from '../control/state';
import * as switcher from '../control/switcher';
import * as rceIOTranslator from '../servers/rce-io-translator';

const log = debug('rce:sequence:startup');

export default function seq() {
  // Initialise the system
  system.init();

  // Initialise the server
  server();

  // Wait for the socket to connect
  store.rceState.on('rceIO.connected-changed', (event) => {
    if (event.newValue) {
      if (!store.hardwareState.board.initialised) {
        boardDriver.init();
        regBoardListeners();
      }
    }
  });
}

// === Private ===

function regBoardListeners() {
  boardDriver.board.on('ready', onBoardReady);
}

function onBoardReady() {
  // Initialise the leds
  if (!store.hardwareState.leds.initialised) {
    leds.init();
  }
  leds.tempBlink(leds.hw.indicator, 100, 3);

  if (!store.hardwareState.analog.initialised) {
    analog.init();
  }

  // Initialise the Servos
  if (!store.hardwareState.servos.initialised) {
    servos.init();
  }

  // Initialise the camera
  if (!store.hardwareState.camera.initialised) {
    camera.init();
  }

  // Initialise the ultrasonic sensors
  if (!store.hardwareState.proximity.initialised) {
    proximity.init();
    proximity.start();
  }

  store.hardwareState.repush();
  store.rceState.repush();

  rceIOTranslator.requestRepush('control', '*');

  system.startProcessMonitoring();

  stateLoop.start();
  leds.tempBlink(leds.hw.indicator, 50, 5);
}
