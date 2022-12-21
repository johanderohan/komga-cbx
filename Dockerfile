# Use the official image as a parent image.
FROM node:current-slim

# Set the working directory.
RUN apt-get update && apt-get -y install software-properties-common
RUN apt-add-repository non-free
RUN apt-get update && apt-get -y install p7zip-full p7zip-rar zip
RUN mkdir -p /usr/src/app
RUN mkdir -p /temp
WORKDIR /usr/src/app

ARG KOMGA
ENV KOMGA=$KOMGA

ARG USERNAME
ENV USERNAME=$USERNAME

ARG PASSWORD
ENV PASSWORD=$PASSWORD

ARG BACKUP
ENV BACKUP=$BACKUP

# Copy the file from your host to your current location.
COPY package.json .

# Run the command inside your image filesystem.
RUN npm install

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 3000

# Run the specified command within the container.
CMD [ "npm", "start" ]

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .
