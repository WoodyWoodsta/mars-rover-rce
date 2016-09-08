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
 *  - Establish connection with RSVP server <-- This may not be needed, the RCE is a server itself!
 *    - Sockets
 *    - WebRTC
 *  - Fire "standard system test" sequence
 */
import debug from 'debug';

import server from '../server';
import * as boardDriver from '../hardware/board';
import * as leds from '../hardware/leds';
import * as servos from '../hardware/servos';
import * as camera from '../hardware/camera';
import * as system from '../system';

const log = debug('rce:startup-sequence');

export default function seq() {
  server();
  boardDriver.init();
  regBoardListeners();
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

  system.startProcessMonitoring();
}
