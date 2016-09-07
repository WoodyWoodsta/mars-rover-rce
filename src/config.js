/* config.js */

export const config = {
  server: {
    port: 3000,
  },

  systemMonitor: {
    period: 1000,
  },

  hardware: {
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
      headTilt: 9,
    },

    servoDeadband: {
      // TODO: Test hacked servos for deadbands
      driveFrontLeft: [90, 90],
      driveFrontRight: [90, 90],
      driveRearLeft: [90, 90],
      driveRearRight: [90, 90],
    },

    cameraMaxRetry: 3,
    cameraStartCmdLine: '/usr/local/bin/mjpg_streamer -i "/usr/local/lib/input_uvc.so -d /dev/video0 -n -r 360x240 -f 30" -o "/usr/local/lib//output_http.so -n -p 8080 -w /usr/local/www"',
  },
};

export const foo = {
  bar: 'Hello World',
};
