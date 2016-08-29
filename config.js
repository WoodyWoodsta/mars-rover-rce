/* config.js */

export const config = {
  server: {
    port: 3000,
  },

  hardware: {
    servoShield: {
      i2cAddress: 0x40,
    },

    servoPins: {
      driveFrontLeft: 0,
      driveFrontRight: 1,
      driveRearLeft: 2,
      driveRearRight: 3,
      steerFrontLeft: 4,
      steerFrontRight: 5,
      steerRearLeft: 6,
      steerRearRight: 7,
      headPan: 8,
      headTilt: 9,
    },

    servoDeadband: {
      // TODO: Test hacked servos for deadbands
      driveFrontLeft: [90, 90],
      driveFrontRight: [90, 90],
      driveRearLeft: [90, 90],
      driveRearRight: [90, 90],
    },
  },
};
