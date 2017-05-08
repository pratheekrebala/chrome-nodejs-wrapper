#!/bin/bash
Xvfb :99 -screen 0 1024x768x16 &> xvfb.log &
DISPLAY=:99.0
export DISPLAY
service dbus start
nohup google-chrome --disable-gpu --remote-debugging-port=9222 --no-sandbox --user-data-dir=/chromedata & \n
x11vnc -nap -noxdamage -passwd PASSWORD -display :99 -forever -rfbport 5901 -shared