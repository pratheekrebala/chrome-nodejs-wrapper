#!/bin/bash
service dbus start
#Xvfb :99 &> /xvfb.log &
Xvfb -ac :99 -screen 0 1280x1024x16 &
export DISPLAY=:99.0
#export DISPLAY
#export DBUS_SESSION_BUS_ADDRESS=/dev/null
google-chrome --disable-gpu --remote-debugging-port=9222 --no-sandbox --disable-extensions --kiosk --disable-hang-monitor --disable-background-timer-throttling --no-first-run --user-data-dir=/chromedata 'about:blank' &
#x11vnc -nap -noxdamage -passwd PASSWORD -display :99 -forever -rfbport 5901 -shared &
sleep 10s
#cd /usr/src/code && node worker.js &
tail -f /dev/null