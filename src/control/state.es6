/* state.es6 */

// Will manage updating the state of the hardware inputs in a timed loop

export class StateDriver {
  constructor(params, timingFunc) {
    this.servos = params.servos;

    Object.keys(this.servos).forEach((servo) => {
      // Set collective or default timing function
      if (!servo.timingFunc) {
        servo.timingFunc = timingFunc || 'linear';
      }

      // Set default velocity
      if (!servo.velocity) {
        servo.velocity = 1;
      }
    });
  }
}

// === Private ===
