FROM node:lts-slim

RUN apt-get update
RUN DEBIAN_FRONTEND="noninteractive" \
    apt-get install -y \
        build-essential \
        git \
        libsecret-1-dev \
        fakeroot \
        libx11-dev \
        libxkbfile-dev \
        libgdk-pixbuf2.0-dev \
        libgtk-3-dev \
        libxss-dev \
        libasound2-dev \
        libnss3

COPY . /atom
WORKDIR /atom

# Github's package registry is REALLY not responding
# FIXME: Remove the additional retries when we migrate away from it
RUN yarn install || yarn install || yarn install ||  yarn install
RUN yarn run build
RUN yarn run build:apm

CMD ["bash"]
