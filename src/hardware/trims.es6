/* trims.es6 */
export const servos = {
  offset: {
    driveFrontLeft: 0,
    driveFrontRight: 0,
    driveRearLeft: 0,
    driveRearRight: 0,
    steerFrontLeft: 0,
    steerFrontRight: 0,
    steerRearLeft: 0,
    steerRearRight: 0,
  },

  multiplier: {
    driveFrontLeft: 0,
    driveFrontRight: 0,
    driveRearLeft: 0,
    driveRearRight: 0,
    steerFrontLeft: 0,
    steerFrontRight: 0,
    steerRearLeft: 0,
    steerRearRight: 0,
  },
};

export const proximity = {
  modifiers: {
    front: _frontUsSensorMod,
    rear: _rearUsSensorMod,
    head: _headUsSensorMod,
  },
};

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
