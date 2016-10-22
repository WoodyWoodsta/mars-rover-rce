/* config.js */

export const config = {
  server: {
    port: 3000,
  },

  systemMonitor: {
    period: 1000,
  },

  hardware: {
    telemetryInterval: 500,

    stateLoopInterval: 10,
    stateLoopMaxDuration: 700,
    stateLoopPennerFamily: 'Quad',

    wheelPitch: 70,
    wheelSpan: 120,

    servoShield: {
      i2cAddress: 0x40,
      controller: 'PCA9685',
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
      headPitch: 9,
    },

    servoDeadband: {
      // TODO: Test hacked servos for deadbands
      driveFrontLeft: [90, 90],
      driveFrontRight: [90, 90],
      driveRearLeft: [90, 90],
      driveRearRight: [90, 90],
    },

    // How frequently to update measurements
    proximityReadPeriod: 100,
    proximityTriggerPeriod: 33,
    proximityTriggerLength: 1,
    proximityChangeThreshold: 1,

    proximityVoltagePins: {
      front: 'A0',
      rear: 'A1',
      head: 'A2',
    },

    proximityTriggerPins: {
      front: 3,
      rear: 4,
      head: 5,
    },

    // Threshold at which to warn of obstacle
    proximityThreshholds: {
      warn: {
        frontSensor: 50,
        rearSensor: 200,
        headSensor: 100,
      },

      shutdown: {
        frontSensor: 20,
        rearSensor: 30,
        headSensor: 30,
      },
    },

    proximityMax: {
      frontSensor: 5000,
      rearSensor: 5000,
      headSensor: 5000,
    },

    cameraMaxRetry: 3,
    cameraStartCmdLine: '/usr/local/bin/mjpg_streamer -i "/usr/local/lib/input_uvc.so -d /dev/video0 -n -r 640x480 -f 30" -o "/usr/local/lib//output_http.so -n -p 8080 -w /usr/local/www"',
  },
};
