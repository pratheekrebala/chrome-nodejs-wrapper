# Launch container using:

`docker run --entrypoint=/bin/bash -p 5901:5901 -v $(pwd):/usr/src/app --security-opt seccomp=chrome.json --privileged -it chrome-headless`

Seccomp file from [@jessfraz](https://github.com/jessfraz/dockerfiles/blob/master/chrome/stable/Dockerfile)