/* startup.es6 */
/**
 * The very first sequence run at startup of the rover
 *
 * Sequence:
 *  - Start the servers ✓
 *  - Initialise the board ✓
 *  - Register board listeners
 *  - Initialise analog inputs
 *  - Check vitals: only proceed if vitals pass
 *  - Initialise leds ✓
 *  - Initialise servos ✓
 *  - Initialise proximity sensors
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
import * as servos from '../hardware/servos';
import * as camera from '../hardware/camera';
import * as proximity from '../hardware/proximity';
import * as system from '../system';
import * as store from '../store';

const log = debug('rce:startup-sequence');

export default function seq() {
  server();

  store.rceState.on('rceIO.connected-changed', (event) => {
    if (event.newValue) {
      boardDriver.init();
      regBoardListeners();
    }
  });
}

// === Private ===

function regBoardListeners() {
  boardDriver.board.on('ready', onBoardReady);
}

function onBoardReady() {
  // Initialise the leds
  leds.init();
  leds.tempBlink(leds.hw.indicator, 100, 3);

  // Initialise the Servos
  servos.init();

  // Initialise the camera
  camera.init();

  // Initialise the ultrasonic sensors
  proximity.init();
  proximity.start();

  system.startProcessMonitoring();
  leds.tempBlink(leds.hw.indicator, 50, 5);
}
