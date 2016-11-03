/* trims.es6 */
export const servos = {
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
