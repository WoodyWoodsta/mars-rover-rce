/* sequence.es6 */

export class SeqCmd {
  constructor(name, type, params = {}) {
    this.name = name;
    this._name = this.constructor.name;
    this.type = type;
    this.params = params;
  }
}

export class PauseCmd extends SeqCmd {
  constructor(params = {}) {
    super('Pause', 'low');

    this.params = {
      duration: {
        type: Number,
        unit: 'sec',
        icon: 'rsvp:access-time',
        value: params.duration || null,
      },
    };
  }
}

export class SingleWheelRotateCmd extends SeqCmd {
  constructor(params = {}) {
    super('Single Wheel Rotate', 'low');

    this.params = {
      wheel: {
        type: String,
        values: ['fl', 'fr', 'rl', 'rr'],
        unit: null,
        icon: 'rsvp:wheel',
        value: params.wheel || null,
      },
      angle: {
        type: Number,
        unit: 'deg',
        icon: 'rsvp:angle',
        value: params.angle || null,
      },
      velocity: {
        type: Number,
        unit: '%',
        icon: 'rsvp:velocity',
        value: params.velocity || null,
      },
      waitForComplete: {
        type: Boolean,
        unit: null,
        icon: 'rsvp:wait-for-complete',
        value: params.waitForComplete || true,
      },
    };
  }
}

export class SingleWheelDriveCmd extends SeqCmd {
  constructor(params = {}) {
    super('Single Wheel Drive', 'low');

    this.params = {
      duration: {
        type: Number,
        unit: 'sec',
        icon: 'rsvp:access-time',
        value: params.duration || null,
      },
      wheel: {
        type: String,
        values: ['fl', 'fr', 'rl', 'rr'],
        unit: null,
        icon: 'rsvp:wheel',
        value: params.wheel || null,
      },
      velocity: {
        type: Number,
        unit: '%',
        icon: 'rsvp:velocity',
        value: params.velocity || null,
      },
      direction: {
        type: String,
        values: ['fwd', 'rev'],
        unit: null,
        icon: 'rsvp:near-me',
        value: params.direction || null,
      },
    };
  }
}

export class DriveCmd extends SeqCmd {
  constructor(params = {}) {
    super('Drive', 'high');

    this.params = {
      duration: {
        type: Number,
        unit: 'sec',
        icon: 'rsvp:access-time',
        value: params.duration || null,
      },
      velocity: {
        type: Number,
        unit: '%',
        icon: 'rsvp:velocity',
        value: params.velocity || null,
      },
      direction: {
        type: String,
        values: ['fwd', 'rev'],
        unit: null,
        icon: 'rsvp:near-me',
        value: params.direction || null,
      },
      arc: {
        type: Number,
        unit: null,
        icon: 'rsvp:',
        value: params.arc || null,
      },
    };
  }
}

export class WheelsRotateCmd extends SeqCmd {
  constructor(params = {}) {
    super('Wheels Rotate', 'high');

    this.params = {
      angle: {
        type: Number,
        unit: 'deg',
        icon: 'rsvp:near-me',
        value: params.angle || null,
      },
      velocity: {
        type: Number,
        unit: '%',
        icon: 'rsvp:velocity',
        value: params.velocity || null,
      },
    };
  }
}

export class RoverRotateCmd extends SeqCmd {
  constructor(params = {}) {
    super('Rover Rotate', 'macro');

    this.params = {
      duration: {
        type: Number,
        unit: 'sec',
        icon: 'rsvp:access-time',
        value: params.duration || null,
      },
      velocity: {
        type: Number,
        unit: '%',
        icon: 'rsvp:velocity',
        value: params.velocity || null,
      },
      direction: {
        type: String,
        values: ['cw', 'ccw'],
        unit: null,
        icon: 'rsvp:near-me',
        value: params.direction || null,
      },
    };
  }
}