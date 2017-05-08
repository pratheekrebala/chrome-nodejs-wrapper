FROM ubuntu

RUN apt-get update
RUN apt-get install -y wget python-pip xvfb
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update
RUN apt-get install -y google-chrome-stable
RUN mkdir /chromedata
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -     && apt-get install -y nodejs
RUN apt-get install -y x11vnc
COPY . /usr/src/app
RUN chmod +x /usr/src/app/init.sh
ENTRYPOINT ["/usr/src/app/init.sh"]