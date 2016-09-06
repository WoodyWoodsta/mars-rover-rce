#!/bin/sh

/usr/local/bin/mjpg_streamer -i "/usr/local/lib/input_uvc.so -n -r 640x480 -f 30" -o "/usr/local/lib//output_http.so -n -p 8080 -w /usr/local/www"
